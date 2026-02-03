import { throttle } from "throttle-debounce";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { Muxer } from "@/lib/muxer/muxer";
import { RecorderResources } from "./recorder-resources";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import {
  precomputeFFTData,
  getFrameAtTime,
  type PrecomputedFFTData,
} from "@/lib/audio/fft-precompute";

const frameSize = 20;

export class MediaCompositor {
  private readonly videoEncoder: VideoEncoder;
  private readonly audioEncoder: AudioEncoder;
  private progress = {
    fft: 0,
    audio: { render: 0, encode: 0 },
    video: { render: 0, encode: 0 },
  };
  private readonly canvas: OffscreenCanvas;

  constructor(
    private readonly resources: RecorderResources,
    private readonly muxer: Muxer,
    private readonly onProgress: (progress: number) => void,
  ) {
    const onError = (error: DOMException) => {
      console.error("error on media compositor", error);
    };
    const audioEncoder = new AudioEncoder({
      output: (chunk, metadata) => {
        void this.muxer.addAudioChunk(chunk, metadata);
      },
      error: onError,
    });
    const { serializedAudio } = this.resources;

    audioEncoder.configure({
      codec: this.muxer.audioCodec,
      sampleRate: serializedAudio.sampleRate,
      numberOfChannels: serializedAudio.numberOfChannels,
      bitrate: 192_000,
    });

    audioEncoder.addEventListener("dequeue", this.onProgressInternal);

    const videoEncoder = new VideoEncoder({
      output: (chunk, metadata) => {
        void this.muxer.addVideoChunk(chunk, metadata);
      },
      error: onError,
    });

    videoEncoder.addEventListener("dequeue", this.onProgressInternal);
    this.canvas = new OffscreenCanvas(
      this.rendererConfig.resolution.width,
      this.rendererConfig.resolution.height,
    );

    videoEncoder.configure({
      codec: this.muxer.videoCodec,
      width: this.canvas.width,
      height: this.canvas.height,
      bitrate: 10_000_000,
      framerate: this.fps,
    });

    this.audioEncoder = audioEncoder;
    this.videoEncoder = videoEncoder;
  }
  private get rendererConfig() {
    return this.resources.rendererConfig;
  }

  private get midiTracks() {
    return this.resources.midiTracks;
  }

  private get serializedAudio() {
    return this.resources.serializedAudio;
  }

  private get backgroundImageBitmap() {
    return this.resources.backgroundImageBitmap;
  }

  private get fps() {
    return this.rendererConfig.fps;
  }
  private get duration() {
    return this.serializedAudio.duration;
  }

  private get totalVideoFrames() {
    return this.duration * this.fps;
  }

  private get totalAudioFrames() {
    return Math.ceil((this.serializedAudio.duration * 1000) / frameSize);
  }

  async composite() {
    await this.muxer.start();
    this.renderAudio();
    this.renderVideo();

    await Promise.all([this.videoEncoder.flush(), this.audioEncoder.flush()]);
    await this.muxer.finalize();
    const videoBlob = new Blob([this.muxer.buffer], {
      type: this.muxer.mimeType,
    });
    return videoBlob;
  }

  private updateProgress(type: "audio" | "video", stage: "render" | "encode") {
    this.progress[type][stage]++;
    this.onProgressInternal();
  }

  private renderAudio() {
    const samplesPerFrame =
      (this.serializedAudio.sampleRate * frameSize) / 1000;
    const numberOfFrames = this.totalAudioFrames;
    for (let i = 0; i < numberOfFrames; i++) {
      const startSample = i * samplesPerFrame;
      const endSample = Math.min(
        (i + 1) * samplesPerFrame,
        this.serializedAudio.length,
      );
      const timestamp = Math.floor(
        (startSample / this.serializedAudio.sampleRate) * 1_000_000,
      );
      const frameSamples = endSample - startSample;
      const frameData = new Float32Array(
        this.serializedAudio.numberOfChannels * frameSamples,
      );

      for (
        let channel = 0;
        channel < this.serializedAudio.numberOfChannels;
        channel++
      ) {
        const sourceData = this.serializedAudio.channels[channel];
        frameData.set(
          sourceData.subarray(startSample, endSample),
          channel * frameSamples,
        );
      }

      const audioData = new AudioData({
        timestamp,
        numberOfChannels: this.serializedAudio.numberOfChannels,
        numberOfFrames: frameSamples,
        sampleRate: this.serializedAudio.sampleRate,
        format: "f32-planar",
        data: frameData,
      });
      this.updateProgress("audio", "render");

      this.audioEncoder.encode(audioData);
      audioData.close();
      this.updateProgress("audio", "encode");
    }
  }

  private renderVideo() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context");

    const backgroundRenderer = new BackgroundRenderer(
      ctx,
      this.rendererConfig,
      this.backgroundImageBitmap,
    );
    const audioVisualizerOverlay = new AudioVisualizerOverlay(
      ctx,
      this.rendererConfig.audioVisualizerConfig,
    );
    const renderer = getRendererFromConfig(ctx, this.rendererConfig);
    const midiOffset = this.midiTracks?.midiOffset ?? 0;
    const tracks = this.midiTracks?.tracks ?? [];
    const totalVideoFrames = this.totalVideoFrames;
    const layer = this.rendererConfig.audioVisualizerLayer;

    // Pre-compute FFT data with temporal smoothing for smooth visualization
    const precomputedFFT = this.precomputeAudioVisualizerData();

    for (let i = 0; i < totalVideoFrames; i++) {
      const progress = i / totalVideoFrames;
      const currentTime = progress * this.duration;

      // 1. Render background
      backgroundRenderer.render();

      // 2. Get frequency data for audio visualizer (from pre-computed data)
      const frequencyData = precomputedFFT
        ? getFrameAtTime(precomputedFFT, currentTime)
        : null;

      // 3. Render audio visualizer in back layer (under MIDI)
      if (layer === "back") {
        audioVisualizerOverlay.render(frequencyData);
      }

      // 4. Render MIDI visualizer
      renderer.render(tracks, currentTime + midiOffset);

      // 5. Render audio visualizer in front layer (over MIDI)
      if (layer === "front") {
        audioVisualizerOverlay.render(frequencyData);
      }

      this.updateProgress("video", "render");

      const frame = new VideoFrame(this.canvas, {
        timestamp: currentTime * 1000000,
        duration: (1 / this.fps) * 1000000,
      });

      const keyFrame = i % 60 === 0;

      this.videoEncoder.encode(frame, { keyFrame });
      frame.close();
      this.updateProgress("video", "encode");
    }
  }

  /**
   * Pre-compute FFT data for all frames with temporal smoothing.
   * This eliminates flickering by applying smoothing across frames.
   */
  private precomputeAudioVisualizerData(): PrecomputedFFTData | null {
    const { audioVisualizerConfig } = this.rendererConfig;
    if (audioVisualizerConfig.style === "none") {
      // Skip FFT precomputation, immediately report full progress
      this.progress.fft = this.totalVideoFrames;
      this.onProgressInternal();
      return null;
    }

    console.log(
      "[MediaCompositor] Pre-computing FFT data for audio visualizer...",
    );
    const data = precomputeFFTData(this.serializedAudio, this.fps, {
      fftSize: audioVisualizerConfig.fftSize,
      smoothingTimeConstant: audioVisualizerConfig.smoothingTimeConstant,
      onProgress: (current) => {
        this.progress.fft = current;
        this.onProgressInternal();
      },
    });
    console.log(
      `[MediaCompositor] Pre-computed ${data.frames.length} FFT frames`,
    );
    return data;
  }

  private get progressTotal() {
    // 5 stages: FFT + audio render + audio encode + video render + video encode
    return (
      this.totalVideoFrames +
      (this.totalAudioFrames + this.totalVideoFrames) * 2
    );
  }

  private onProgressInternal = () => {
    const audioQueueSize = this.audioEncoder.encodeQueueSize;
    const videoQueueSize = this.videoEncoder.encodeQueueSize;

    const totalProgress =
      this.progress.fft +
      this.progress.audio.render +
      this.progress.audio.encode +
      this.progress.video.render +
      this.progress.video.encode;

    const queueSize = audioQueueSize + videoQueueSize;
    const progress = (totalProgress - queueSize) / this.progressTotal;
    this.onProgressThrottled(progress);
  };

  private onProgressThrottled = throttle(500, (progress: number) => {
    console.log(
      `Progress: ${progress.toFixed(2)}`,
      `Total: ${this.progressTotal}`,
      `FFT: ${this.progress.fft}`,
      `Audio Render: ${this.progress.audio.render}`,
      `Audio Encode: ${this.progress.audio.encode}`,
      `Video Render: ${this.progress.video.render}`,
      `Video Encode: ${this.progress.video.encode}`,
    );
    this.onProgress(progress);
  });

  [Symbol.dispose](): void {
    this.videoEncoder.removeEventListener("dequeue", this.onProgressInternal);
    this.audioEncoder.removeEventListener("dequeue", this.onProgressInternal);
    if (this.audioEncoder.state !== "closed") {
      this.audioEncoder.close();
    }
    if (this.videoEncoder.state !== "closed") {
      this.videoEncoder.close();
    }
  }
}
