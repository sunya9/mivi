import { throttle } from "throttle-debounce";
import { getRendererFromConfig } from "@/lib/utils";
import { Muxer } from "@/lib/muxer";
import { RecorderResources } from "./recorder-resources";

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
      output: (chunk) => {
        this.muxer.addAudioChunk(chunk);
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
        this.muxer.addVideoChunk(chunk, metadata);
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
    this.renderAudio();
    this.renderVideo();

    await Promise.all([this.videoEncoder.flush(), this.audioEncoder.flush()]);
    this.muxer.finalize();
    const videoBlob = new Blob([this.muxer.buffer], {
      type: "video/webm",
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

    const renderer = getRendererFromConfig(
      ctx,
      this.rendererConfig,
      this.backgroundImageBitmap,
    );
    const totalVideoFrames = this.totalVideoFrames;
    for (let i = 0; i < totalVideoFrames; i++) {
      const progress = i / totalVideoFrames;
      renderer.render(this.midiTracks.tracks, {
        currentTime: progress * this.duration,
        duration: this.duration,
      });

      this.updateProgress("video", "render");

      const frame = new VideoFrame(this.canvas, {
        timestamp: progress * this.duration * 1000000,
        duration: (1 / this.fps) * 1000000,
      });

      const keyFrame = i % 60 === 0;

      this.videoEncoder.encode(frame, { keyFrame });
      frame.close();
      this.updateProgress("video", "encode");
    }
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
    this.audioEncoder.close();
    this.videoEncoder.close();
  }
}
