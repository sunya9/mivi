import { SerializedAudio } from "@/lib/AudioHandler";
import { getRendererFromName } from "@/lib/utils";
import { MidiState } from "@/types/midi";
import { Estimation, Measurements } from "arrival-time";
import { Muxer, ArrayBufferTarget } from "webm-muxer";
import { throttle } from "throttle-debounce";
export type MediaCompositorStatus = "render" | "encode" | "complete";
export type OnProgress = (
  progress: number, // 0 ~ 1
  eta: Measurements,
  status: MediaCompositorStatus,
) => void;
const frameSize = 20;

export class MediaCompositor {
  private readonly videoEncoder: VideoEncoder;
  private readonly audioEncoder: AudioEncoder;
  private readonly muxer: Muxer<ArrayBufferTarget>;
  private status: MediaCompositorStatus = "render";
  private progressList = {
    renderAudio: 0,
    renderVideo: 0,
    encodeAudio: 0,
    encodeVideo: 0,
  };
  private readonly estimation = new Estimation({
    total: Object.keys(this.progressList).length,
  });
  constructor(
    private readonly canvas: OffscreenCanvas,
    private readonly rendererName: string,
    private readonly midiState: MidiState,
    private readonly serializedAudio: SerializedAudio,
    private readonly fps: number,
    private readonly onProgress: OnProgress,
    onError: (error: Error) => void,
  ) {
    this.muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: "V_VP9",
        width: canvas.width,
        height: canvas.height,
        frameRate: fps,
      },
      audio: {
        codec: "A_OPUS",
        numberOfChannels: serializedAudio.numberOfChannels,
        sampleRate: serializedAudio.sampleRate,
      },
    });

    const audioEncoder = new AudioEncoder({
      output: (chunk) => {
        this.muxer.addAudioChunk(chunk);
      },
      error: onError,
    });

    audioEncoder.configure({
      codec: "opus",
      sampleRate: serializedAudio.sampleRate,
      numberOfChannels: serializedAudio.numberOfChannels,
    });

    audioEncoder.addEventListener("dequeue", this.dequeueAudioListener);

    const videoEncoder = new VideoEncoder({
      output: (chunk) => {
        this.muxer.addVideoChunk(chunk);
      },
      error: onError,
    });

    videoEncoder.addEventListener("dequeue", this.dequeueVideoListener);

    videoEncoder.configure({
      codec: "vp09.00.10.08",
      width: canvas.width,
      height: canvas.height,
      bitrate: 500_000,
      framerate: fps,
    });
    this.audioEncoder = audioEncoder;
    this.videoEncoder = videoEncoder;
  }

  private get totalVideoFrames() {
    return this.midiState.duration * this.fps;
  }

  private get totalAudioFrames() {
    return Math.ceil((this.serializedAudio.duration * 1000) / frameSize);
  }

  async composite() {
    this.renderVideo();
    this.onProgressInternal({ renderVideo: 1 });
    this.renderAudio();
    this.onProgressInternal({ renderAudio: 1 });

    this.status = "encode";
    await Promise.all([this.videoEncoder.flush(), this.audioEncoder.flush()]);
    this.status = "complete";
    this.muxer.finalize();
    const videoBlob = new Blob([this.muxer.target.buffer], {
      type: "video/webm",
    });
    this.onProgressInternal({
      encodeVideo: 1,
      encodeAudio: 1,
      renderAudio: 1,
      renderVideo: 1,
    });
    return videoBlob;
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
      this.audioEncoder.encode(audioData);
      audioData.close();
      this.onProgressInternal({ renderAudio: i / numberOfFrames });
    }
  }

  private renderVideo() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context");

    const renderer = getRendererFromName(this.rendererName, ctx);
    const totalVideoFrames = this.totalVideoFrames;

    for (let i = 0; i < totalVideoFrames; i++) {
      const progress = i / totalVideoFrames;
      renderer.render(this.midiState.tracks, {
        currentTime: progress * this.midiState.duration,
        duration: this.midiState.duration,
      });

      const frame = new VideoFrame(this.canvas, {
        timestamp: progress * this.midiState.duration * 1000000,
        duration: this.midiState.duration * 1000000,
      });

      const keyFrame = i % 60 === 0;
      this.videoEncoder.encode(frame, { keyFrame });
      frame.close();
      this.onProgressInternal({ renderVideo: progress });
    }
  }

  private onProgressInternal = throttle(
    500,
    (progressList: Partial<typeof this.progressList>) => {
      this.progressList = {
        ...this.progressList,
        ...progressList,
      };
      const values = Object.values(this.progressList);
      const progress = values.reduce((sum, value) => sum + value, 0);
      const eta = this.estimation.update(progress);
      this.onProgress(progress / values.length, eta, this.status);
    },
  );

  private dequeueVideoListener = () => {
    if (this.videoEncoder.encodeQueueSize % 100 !== 0) return;
    const progress =
      1 - this.videoEncoder.encodeQueueSize / this.totalVideoFrames;
    this.onProgressInternal({ encodeVideo: progress });
  };

  private dequeueAudioListener = () => {
    if (this.audioEncoder.encodeQueueSize % 100 !== 0) return;
    const progress =
      1 - this.audioEncoder.encodeQueueSize / this.totalAudioFrames;
    this.onProgressInternal({ encodeAudio: progress });
  };

  [Symbol.dispose](): void {
    this.videoEncoder.removeEventListener("dequeue", this.dequeueVideoListener);
    this.audioEncoder.removeEventListener("dequeue", this.dequeueAudioListener);
    this.audioEncoder.close();
    this.videoEncoder.close();
  }
}
