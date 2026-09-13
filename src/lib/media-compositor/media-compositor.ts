import { precomputeFFTData, getFrameAtTime } from "@/lib/audio/fft-precompute";
import { Muxer } from "@/lib/muxer/muxer";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { drawFrame } from "@/lib/renderers/draw-frame";

import { EncodeQueue } from "./encode-queue";
import { ExportProgressTracker, type ActivePhase } from "./export-progress-tracker";
import { RecorderResources } from "./recorder-resources";

const frameSize = 20;
const maxEncodeQueueSize = 6;

type ExportPhase = "FFT" | "Audio Render" | "Audio Encode" | "Video Render" | "Video Encode";

export class MediaCompositor {
  readonly #videoQueue: EncodeQueue<Parameters<VideoEncoder["encode"]>>;
  readonly #audioQueue: EncodeQueue<Parameters<AudioEncoder["encode"]>>;
  readonly #canvas: OffscreenCanvas;
  readonly #resources: RecorderResources;
  readonly #muxer: Muxer;
  readonly #progress: ExportProgressTracker<ExportPhase>;
  readonly #abort = new AbortController();

  constructor(
    resources: RecorderResources,
    muxer: Muxer,
    onProgress: (progress: number, activePhase?: ActivePhase) => void,
  ) {
    this.#resources = resources;
    this.#muxer = muxer;

    this.#progress = new ExportProgressTracker(onProgress);
    this.#progress.addPhase({ name: "FFT", total: this.#totalVideoFrames });
    this.#progress.addPhase({ name: "Audio Render", total: this.#totalAudioFrames });
    this.#progress.addPhase({
      name: "Audio Encode",
      total: this.#totalAudioFrames,
      getCompleted: () => this.#audioQueue.completed,
    });
    this.#progress.addPhase({ name: "Video Render", total: this.#totalVideoFrames });
    this.#progress.addPhase({
      name: "Video Encode",
      total: this.#totalVideoFrames,
      getCompleted: () => this.#videoQueue.completed,
    });

    const onError = (error: unknown) => this.#abort.abort(error);

    const audioEncoder = new AudioEncoder({
      output: (chunk, metadata) => void muxer.addAudioChunk(chunk, metadata).catch(onError),
      error: onError,
    });
    audioEncoder.configure({
      codec: muxer.config.audioCodec,
      sampleRate: this.#serializedAudio.sampleRate,
      numberOfChannels: this.#serializedAudio.numberOfChannels,
      bitrate: 192_000,
    });
    this.#audioQueue = new EncodeQueue(audioEncoder, this.#onDequeue);

    const videoEncoder = new VideoEncoder({
      output: (chunk, metadata) => void muxer.addVideoChunk(chunk, metadata).catch(onError),
      error: onError,
    });
    this.#canvas = new OffscreenCanvas(
      this.#rendererConfig.resolution.width,
      this.#rendererConfig.resolution.height,
    );
    videoEncoder.configure({
      codec: muxer.config.videoCodec(this.#rendererConfig.resolution, this.#fps),
      width: this.#canvas.width,
      height: this.#canvas.height,
      bitrate: 10_000_000,
      framerate: this.#fps,
    });
    this.#videoQueue = new EncodeQueue(videoEncoder, this.#onDequeue);
  }

  #onDequeue = () => this.#progress.notify();

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
  get #totalAudioFrames() {
    return Math.ceil((this.#duration * 1000) / frameSize);
  }

  async composite() {
    await this.#muxer.start();
    this.#renderAudio();
    await this.#renderVideo();

    await Promise.all([this.#videoQueue.flush(), this.#audioQueue.flush()]);
    await this.#muxer.finalize();
  }

  #renderAudio() {
    const { sampleRate, numberOfChannels, channels, length } = this.#serializedAudio;
    const samplesPerFrame = (sampleRate * frameSize) / 1000;

    for (let i = 0; i < this.#totalAudioFrames; i++) {
      const startSample = i * samplesPerFrame;
      const endSample = Math.min((i + 1) * samplesPerFrame, length);
      const timestamp = Math.floor((startSample / sampleRate) * 1_000_000);
      const frameSamples = endSample - startSample;
      const frameData = new Int16Array(numberOfChannels * frameSamples);

      for (let channel = 0; channel < numberOfChannels; channel++) {
        frameData.set(channels[channel].subarray(startSample, endSample), channel * frameSamples);
      }

      const audioData = new AudioData({
        timestamp,
        numberOfChannels,
        numberOfFrames: frameSamples,
        sampleRate,
        format: "s16-planar",
        data: frameData,
      });

      this.#progress.increment("Audio Render");
      this.#audioQueue.encode(audioData);
      audioData.close();
    }
  }

  async #renderVideo() {
    const ctx = this.#canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context");

    const config = this.#rendererConfig;
    const backgroundImageBitmap = this.#resources.backgroundImageBitmap;
    const renderer = createRenderer(config.type, ctx);
    const midiOffset = this.#resources.midiTracks?.midiOffset ?? 0;
    const tracks = this.#resources.midiTracks?.tracks ?? [];

    const precomputedFFT = this.#precomputeFFT();

    for (let i = 0; i < this.#totalVideoFrames; i++) {
      const currentTime = i / this.#fps;

      drawFrame(ctx, {
        config,
        renderer,
        tracks,
        currentTime: currentTime + midiOffset,
        frequencyData: precomputedFFT ? getFrameAtTime(precomputedFFT, currentTime) : null,
        backgroundImageBitmap,
      });

      this.#progress.increment("Video Render");

      const frame = new VideoFrame(this.#canvas, {
        timestamp: currentTime * 1_000_000,
        duration: (1 / this.#fps) * 1_000_000,
      });
      this.#videoQueue.encode(frame, { keyFrame: i % 60 === 0 });
      frame.close();

      // --- Backpressure control logic ---
      // If the encoder's queue size exceeds the threshold,
      // pause the loop (yield) until the GPU processes some frames and emits a 'dequeue' event.
      if (this.#videoQueue.pending > maxEncodeQueueSize) {
        // oxlint-disable-next-line no-await-in-loop -- backpressure requires sequential await
        await this.#videoQueue.nextDequeue(this.#abort.signal);
      }
    }
  }

  #precomputeFFT() {
    const { audioVisualizerConfig } = this.#rendererConfig;
    if (audioVisualizerConfig.style === "none") {
      this.#progress.complete("FFT");
      return null;
    }

    return precomputeFFTData(this.#serializedAudio, this.#fps, {
      fftSize: audioVisualizerConfig.fftSize,
      attackTime: audioVisualizerConfig.attackTime,
      releaseTime: audioVisualizerConfig.releaseTime,
      onProgress: (current) => this.#progress.set("FFT", current),
    });
  }

  [Symbol.dispose](): void {
    this.#audioQueue.close();
    this.#videoQueue.close();
  }
}
