export class AudioHandler {
  private audioSource: AudioBufferSourceNode | null = null;
  private startTime = 0;
  private pauseTime = 0;
  constructor(
    private readonly audioContext: AudioContext,
    private readonly audioBuffer: AudioBuffer,
    readonly audio: File,
  ) {}

  pause() {
    if (!this.audioSource) return;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.audioSource.stop();
    this.audioSource = null;
  }
  play() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0, this.pauseTime);
    this.startTime = this.audioContext.currentTime - this.pauseTime;

    this.audioSource = source;
  }

  seek(time: number, wasPlaying?: boolean) {
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
  [Symbol.dispose](): void {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
    }
  }

  get getCurrentTime(): number {
    return this.audioContext.currentTime - this.startTime;
  }

  get getDuration(): number {
    return this.audioBuffer.duration;
  }
}
