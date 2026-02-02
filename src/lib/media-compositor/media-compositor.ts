import { throttle } from "throttle-debounce";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { Muxer } from "@/lib/muxer/muxer";
import { RecorderResources } from "./recorder-resources";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";

const frameSize = 20;

export class MediaCompositor {
  private readonly videoEncoder: VideoEncoder;
  private readonly audioEncoder: AudioEncoder;
  private progress = {
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
    const renderer = getRendererFromConfig(
      ctx,
      this.rendererConfig,
      this.backgroundImageBitmap,
    );
    const midiOffset = this.midiTracks?.midiOffset ?? 0;
    const tracks = this.midiTracks?.tracks ?? [];
    const totalVideoFrames = this.totalVideoFrames;
    const layer = this.rendererConfig.audioVisualizerLayer;

    for (let i = 0; i < totalVideoFrames; i++) {
      const progress = i / totalVideoFrames;
      const currentTime = progress * this.duration;

      // 1. Render background
      backgroundRenderer.render();

      // 2. Get frequency data for audio visualizer
      const frequencyData = this.getFrequencyDataAtTime(currentTime);

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
   * Compute frequency data from audio samples at a specific time.
   * Uses a simple FFT implementation to generate visualization data.
   */
  private getFrequencyDataAtTime(timeInSeconds: number): FrequencyData | null {
    const { audioVisualizerConfig } = this.rendererConfig;
    if (audioVisualizerConfig.style === "none") {
      return null;
    }

    const fftSize = audioVisualizerConfig.fftSize;
    const frequencyBinCount = fftSize / 2;
    const sampleRate = this.serializedAudio.sampleRate;
    const nyquistFrequency = sampleRate / 2;

    // Get the starting sample index for this time
    const startSample = Math.floor(timeInSeconds * sampleRate);

    // Use first channel for analysis (or mix channels if stereo)
    const audioData = this.serializedAudio.channels[0];
    if (!audioData || startSample >= audioData.length) {
      return null;
    }

    // Extract samples for FFT (apply Hann window)
    const samples = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      const sampleIndex = startSample + i;
      const sample =
        sampleIndex < audioData.length ? audioData[sampleIndex] : 0;
      // Apply Hann window
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
      samples[i] = sample * window;
    }

    // Compute FFT magnitude
    const frequencyData = this.computeFFTMagnitude(samples);
    const timeDomainData = new Uint8Array(frequencyBinCount);

    // Convert time domain to 0-255 range (centered at 128)
    for (let i = 0; i < frequencyBinCount && i < fftSize; i++) {
      const sampleIndex = startSample + i;
      const sample =
        sampleIndex < audioData.length ? audioData[sampleIndex] : 0;
      timeDomainData[i] = Math.round((sample + 1) * 127.5);
    }

    return {
      frequencyBinCount,
      frequencyData,
      timeDomainData,
      nyquistFrequency,
    };
  }

  /**
   * Simple DFT-based frequency magnitude computation.
   * Not as efficient as FFT but sufficient for visualization purposes.
   */
  private computeFFTMagnitude(samples: Float32Array): Uint8Array<ArrayBuffer> {
    const n = samples.length;
    const frequencyBinCount = n / 2;
    const magnitudes = new Uint8Array(frequencyBinCount);

    // Simple DFT for visualization (compute only positive frequencies)
    for (let k = 0; k < frequencyBinCount; k++) {
      let real = 0;
      let imag = 0;
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += samples[t] * Math.cos(angle);
        imag -= samples[t] * Math.sin(angle);
      }

      // Compute magnitude and normalize to 0-255 range
      const magnitude = Math.sqrt(real * real + imag * imag) / n;
      // Scale magnitude (adjust multiplier for visual appearance)
      const scaled = Math.min(255, Math.floor(magnitude * 512));
      magnitudes[k] = scaled;
    }

    return magnitudes;
  }

  private get progressTotal() {
    return (this.totalAudioFrames + this.totalVideoFrames) * 2;
  }

  private onProgressInternal = () => {
    const audioQueueSize = this.audioEncoder.encodeQueueSize;
    const videoQueueSize = this.videoEncoder.encodeQueueSize;

    const totalProgress =
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
