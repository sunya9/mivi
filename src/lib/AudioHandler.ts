export type SerializedAudio = AudioHandler["serialize"];

export class AudioHandler {
  private audioSource: AudioBufferSourceNode | null = null;
  private startTime = 0;
  private pauseTime = 0;
  private gainNode: GainNode;

  constructor(
    private readonly audioContext: AudioContext,
    readonly audioBuffer: AudioBuffer,
    readonly audio: File,
    private lastVolume: number = 1,
    private isMuted: boolean = false,
  ) {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.setVolume(lastVolume);
    this.setMuted(isMuted);
  }

  pause() {
    if (!this.audioSource) return;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.audioSource.stop();
    this.audioSource = null;
  }
  play() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.gainNode);
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

  setVolume(value: number) {
    this.lastVolume = value;
    if (!this.isMuted) {
      const volume = Math.max(0, Math.min(1, value));
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setTargetAtTime(volume, now, 0.01);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    const volume = muted ? 0 : this.lastVolume;
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setTargetAtTime(volume, now, 0.01);
  }

  get getCurrentTime(): number {
    return this.audioContext.currentTime - this.startTime;
  }

  get getDuration(): number {
    return this.audioBuffer.duration;
  }

  get serialize() {
    return {
      length: this.audioBuffer.length,
      sampleRate: this.audioBuffer.sampleRate,
      numberOfChannels: this.audioBuffer.numberOfChannels,
      duration: this.audioBuffer.duration,
      channels: Array.from(
        { length: this.audioBuffer.numberOfChannels },
        (_, i) => this.audioBuffer.getChannelData(i),
      ),
    } as const;
  }
}
