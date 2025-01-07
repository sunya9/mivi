import { PlaybackState } from "@/types/player";

export class AudioHandler {
  private audioSource: AudioBufferSourceNode | null = null;
  private startTime = 0;
  private pauseTime = 0;
  private _isPlaying = false;
  constructor(
    private readonly audioContext: AudioContext,
    private readonly audioBuffer: AudioBuffer,
    readonly audio: File,
  ) {}

  get isPlaying() {
    return this._isPlaying;
  }

  pause() {
    if (!this._isPlaying || !this.audioSource) return;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.audioSource.stop();
    this.audioSource = null;
    this._isPlaying = false;
  }
  play() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0, this.pauseTime);
    this.startTime = this.audioContext.currentTime - this.pauseTime;

    this.audioSource = source;
    this._isPlaying = true;
  }

  toggle() {
    if (this._isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time: number) {
    const wasPlaying = this._isPlaying;
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    this.pauseTime = time;
    if (wasPlaying) {
      this.play();
    }
  }

  stop() {
    if (!this.audioSource) return;
    this.audioSource.stop();
    this.audioSource.disconnect();
    this.audioSource = null;
    this._isPlaying = false;
    this.pauseTime = 0;
    this.startTime = 0;
  }

  [Symbol.dispose](): void {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
    }
  }

  get getCurrentTime(): number {
    if (!this._isPlaying) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }

  get getDuration(): number {
    return this.audioBuffer.duration;
  }

  get currentStatus(): PlaybackState {
    return {
      isPlaying: this._isPlaying,
      currentTime: this.getCurrentTime,
      duration: this.getDuration,
    };
  }
}
