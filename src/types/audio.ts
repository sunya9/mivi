export interface SerializedAudio {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  readonly channels: Float32Array[];
}
