import {
  ALL_FORMATS,
  BlobSource,
  CanvasSource,
  Conversion,
  Input,
  Output,
  Quality,
  StreamTarget,
  type ConversionAudioOptions,
  type StreamTargetChunk,
} from "mediabunny";

import { precomputeFFTData, getFrameAtTime } from "@/lib/audio/fft-precompute";
import { OUTPUT_FORMATS, type OutputFormatConfig } from "@/lib/muxer/output-format";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { drawFrame } from "@/lib/renderers/draw-frame";

import { RecorderResources } from "./recorder-resources";

const keyFrameEveryFrames = 60;
const videoBitrate = 10_000_000;
const audioBitrate = 192_000;

export type ExportPhase = "FFT" | "Audio" | "Video Render" | "Video Encode";

export interface ExportPhasePlan {
  name: ExportPhase;
  total: number;
}

export type PhaseProgressListener = (phase: ExportPhase, completed: number) => void;

export class MediaCompositor {
  readonly #resources: RecorderResources;
  readonly #outputFormat: OutputFormatConfig;
  readonly #canvas: OffscreenCanvas;
  readonly #output: Output;
  readonly #video: CanvasSource;
  readonly #listeners = new Set<PhaseProgressListener>();
  readonly phases: readonly ExportPhasePlan[];
  #audioConversion: Conversion | undefined;
  #encodedVideoFrames = 0;

  constructor(resources: RecorderResources, writable: WritableStream<StreamTargetChunk>) {
    this.#resources = resources;

    this.phases = [
      { name: "FFT", total: this.#totalVideoFrames },
      { name: "Audio", total: this.#duration },
      { name: "Video Render", total: this.#totalVideoFrames },
      { name: "Video Encode", total: this.#totalVideoFrames },
    ];

    const { resolution, format } = this.#rendererConfig;
    this.#outputFormat = OUTPUT_FORMATS[format];

    this.#canvas = new OffscreenCanvas(resolution.width, resolution.height);
    this.#video = new CanvasSource(this.#canvas, {
      codec: this.#outputFormat.videoCodec,
      quality: new Quality({ bitrate: videoBitrate }),
      fullCodecString: this.#outputFormat.videoCodecString(resolution, this.#fps),
      keyFrameInterval: keyFrameEveryFrames / this.#fps,
      onEncodedPacket: () => this.#emit("Video Encode", ++this.#encodedVideoFrames),
    });

    this.#output = new Output({
      format: this.#outputFormat.outputFormat,
      target: new StreamTarget(writable),
    });
    this.#output.addVideoTrack(this.#video, { frameRate: this.#fps });
  }

  subscribe(listener: PhaseProgressListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(phase: ExportPhase, completed: number) {
    for (const listener of this.#listeners) listener(phase, completed);
  }

  get #rendererConfig() {
    return this.#resources.rendererConfig;
  }
  get #serializedAudio() {
    return this.#resources.audioSource.serialized;
  }
  get #fps() {
    return this.#rendererConfig.fps;
  }
  get #duration() {
    return this.#serializedAudio.duration;
  }
  get #totalVideoFrames() {
    return Math.ceil(this.#duration * this.#fps);
  }

  async composite() {
    const input = new Input({
      source: new BlobSource(this.#resources.audioSource.file),
      formats: ALL_FORMATS,
    });
    const audio = await this.#initAudioConversion(input);
    try {
      await this.#output.start();
      await audio.execute();
      this.#emit("Audio", this.#duration);
      await this.#renderVideo();
      await this.#output.finalize();
    } finally {
      input.dispose();
    }
  }

  async #initAudioConversion(input: Input) {
    const track = await input.getPrimaryAudioTrack();
    if (!track) throw new Error("No audio track found in file");

    const supportedCodecs = this.#outputFormat.outputFormat.getSupportedAudioCodecs();
    const audio: ConversionAudioOptions =
      track.codec !== null && supportedCodecs.includes(track.codec)
        ? {}
        : {
            codec: this.#outputFormat.audioCodec,
            quality: new Quality({ bitrate: audioBitrate }),
          };

    const conversion = await Conversion.init({
      input,
      output: this.#output,
      composable: true,
      video: { discard: true },
      audio,
    });
    if (!conversion.utilizedTracks.includes(track)) {
      const discarded = conversion.discardedTracks.find((d) => d.track === track);
      throw new Error(`Audio track cannot be exported: ${discarded?.reason ?? "unknown"}`);
    }
    conversion.onProgress = (_, processedTime) =>
      this.#emit("Audio", Math.min(processedTime, this.#duration));
    this.#audioConversion = conversion;
    return conversion;
  }

  async #renderVideo() {
    const ctx = this.#canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context");

    const config = this.#rendererConfig;
    const backgroundImageBitmap = this.#resources.backgroundImageBitmap;
    const renderer = createRenderer(config.type, ctx);
    const midiOffset = this.#resources.midiTracks?.midiOffset ?? 0;
    const tracks = this.#resources.midiTracks?.tracks ?? [];
    const frameDuration = 1 / this.#fps;

    const precomputedFFT = this.#precomputeFFT();

    for (let i = 0; i < this.#totalVideoFrames; i++) {
      const currentTime = i * frameDuration;

      drawFrame(ctx, {
        config,
        renderer,
        tracks,
        currentTime: currentTime + midiOffset,
        frequencyData: precomputedFFT ? getFrameAtTime(precomputedFFT, currentTime) : null,
        backgroundImageBitmap,
      });
      this.#emit("Video Render", i + 1);

      // oxlint-disable-next-line no-await-in-loop -- add() resolves once the encoder and writer can take more
      await this.#video.add(currentTime, frameDuration);
    }
    this.#video.close();
  }

  #precomputeFFT() {
    const { audioVisualizerConfig } = this.#rendererConfig;
    if (audioVisualizerConfig.style === "none") {
      this.#emit("FFT", this.#totalVideoFrames);
      return null;
    }

    return precomputeFFTData(this.#serializedAudio, this.#fps, {
      fftSize: audioVisualizerConfig.fftSize,
      attackTime: audioVisualizerConfig.attackTime,
      releaseTime: audioVisualizerConfig.releaseTime,
      onProgress: (current) => this.#emit("FFT", current),
    });
  }

  [Symbol.dispose](): void {
    if (this.#output.state === "pending" || this.#output.state === "started") {
      void this.#audioConversion?.cancel();
      void this.#output.cancel();
    }
  }
}
