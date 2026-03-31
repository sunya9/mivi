import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { Muxer } from "@/lib/muxer/muxer";
import { RecorderResources } from "./recorder-resources";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import { precomputeFFTData, getFrameAtTime } from "@/lib/audio/fft-precompute";
import { ExportProgressTracker, type ActivePhase } from "./export-progress-tracker";

const frameSize = 20;

type ExportPhase = "FFT" | "Audio Render" | "Audio Encode" | "Video Render" | "Video Encode";

export class MediaCompositor {
  readonly #videoEncoder: VideoEncoder;
  readonly #audioEncoder: AudioEncoder;
  readonly #canvas: OffscreenCanvas;
  readonly #resources: RecorderResources;
  readonly #muxer: Muxer;
  readonly #progress: ExportProgressTracker<ExportPhase>;

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
      getCompleted: () => this.#audioEncodeCount - this.#audioEncoder.encodeQueueSize,
      deferTimer: true,
    });
    this.#progress.addPhase({ name: "Video Render", total: this.#totalVideoFrames });
    this.#progress.addPhase({
      name: "Video Encode",
      total: this.#totalVideoFrames,
      getCompleted: () => this.#videoEncodeCount - this.#videoEncoder.encodeQueueSize,
      deferTimer: true,
    });

    const onError = (error: DOMException) => {
      console.error("error on media compositor", error);
    };

    this.#audioEncoder = new AudioEncoder({
      output: (chunk, metadata) => void muxer.addAudioChunk(chunk, metadata),
      error: onError,
    });
    this.#audioEncoder.configure({
      codec: muxer.config.audioCodec,
      sampleRate: this.#serializedAudio.sampleRate,
      numberOfChannels: this.#serializedAudio.numberOfChannels,
      bitrate: 192_000,
    });
    this.#audioEncoder.addEventListener("dequeue", this.#onDequeue);

    this.#videoEncoder = new VideoEncoder({
      output: (chunk, metadata) => void muxer.addVideoChunk(chunk, metadata),
      error: onError,
    });
    this.#canvas = new OffscreenCanvas(
      this.#rendererConfig.resolution.width,
      this.#rendererConfig.resolution.height,
    );
    this.#videoEncoder.configure({
      codec: muxer.config.videoCodec,
      width: this.#canvas.width,
      height: this.#canvas.height,
      bitrate: 10_000_000,
      framerate: this.#fps,
    });
    this.#videoEncoder.addEventListener("dequeue", this.#onDequeue);
  }

  // Encode counters (tracks calls to encode(), not completions)
  #audioEncodeCount = 0;
  #videoEncodeCount = 0;

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
    return this.#duration * this.#fps;
  }
  get #totalAudioFrames() {
    return Math.ceil((this.#duration * 1000) / frameSize);
  }

  async composite() {
    await this.#muxer.start();
    this.#renderAudio();
    this.#renderVideo();

    // Start encode timers now that render loops are done and flush begins
    this.#progress.startTimer("Audio Encode");
    this.#progress.startTimer("Video Encode");
    await Promise.all([this.#videoEncoder.flush(), this.#audioEncoder.flush()]);
    await this.#muxer.finalize();
    return new Blob([this.#muxer.buffer], { type: this.#muxer.config.mimeType });
  }

  #renderAudio() {
    const { sampleRate, numberOfChannels, channels, length } = this.#serializedAudio;
    const samplesPerFrame = (sampleRate * frameSize) / 1000;

    for (let i = 0; i < this.#totalAudioFrames; i++) {
      const startSample = i * samplesPerFrame;
      const endSample = Math.min((i + 1) * samplesPerFrame, length);
      const timestamp = Math.floor((startSample / sampleRate) * 1_000_000);
      const frameSamples = endSample - startSample;
      const frameData = new Float32Array(numberOfChannels * frameSamples);

      for (let channel = 0; channel < numberOfChannels; channel++) {
        frameData.set(channels[channel].subarray(startSample, endSample), channel * frameSamples);
      }

      const audioData = new AudioData({
        timestamp,
        numberOfChannels,
        numberOfFrames: frameSamples,
        sampleRate,
        format: "f32-planar",
        data: frameData,
      });

      this.#progress.increment("Audio Render");
      this.#audioEncoder.encode(audioData);
      audioData.close();
      this.#audioEncodeCount++;
      this.#progress.increment("Audio Encode");
    }
  }

  #renderVideo() {
    const ctx = this.#canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context");

    const backgroundRenderer = new BackgroundRenderer(
      ctx,
      this.#rendererConfig,
      this.#resources.backgroundImageBitmap,
    );
    const audioVisualizerOverlay = new AudioVisualizerOverlay(
      ctx,
      this.#rendererConfig.audioVisualizerConfig,
      this.#rendererConfig.resolution,
    );
    const renderer = getRendererFromConfig(ctx, this.#rendererConfig);
    const midiOffset = this.#resources.midiTracks?.midiOffset ?? 0;
    const tracks = this.#resources.midiTracks?.tracks ?? [];
    const layer = this.#rendererConfig.audioVisualizerLayer;

    const precomputedFFT = this.#precomputeFFT();

    for (let i = 0; i < this.#totalVideoFrames; i++) {
      const currentTime = (i / this.#totalVideoFrames) * this.#duration;

      backgroundRenderer.render();

      const frequencyData = precomputedFFT ? getFrameAtTime(precomputedFFT, currentTime) : null;

      if (layer === "back") audioVisualizerOverlay.render(frequencyData);
      renderer.render(tracks, currentTime + midiOffset);
      if (layer === "front") audioVisualizerOverlay.render(frequencyData);

      this.#progress.increment("Video Render");

      const frame = new VideoFrame(this.#canvas, {
        timestamp: currentTime * 1_000_000,
        duration: (1 / this.#fps) * 1_000_000,
      });
      this.#videoEncoder.encode(frame, { keyFrame: i % 60 === 0 });
      frame.close();
      this.#videoEncodeCount++;
      this.#progress.increment("Video Encode");
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
      smoothingTimeConstant: audioVisualizerConfig.smoothingTimeConstant,
      onProgress: (current) => this.#progress.set("FFT", current),
    });
  }

  [Symbol.dispose](): void {
    this.#videoEncoder.removeEventListener("dequeue", this.#onDequeue);
    this.#audioEncoder.removeEventListener("dequeue", this.#onDequeue);
    if (this.#audioEncoder.state !== "closed") this.#audioEncoder.close();
    if (this.#videoEncoder.state !== "closed") this.#videoEncoder.close();
  }
}
