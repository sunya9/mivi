export interface SerializedAudio {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  readonly channels: Int16Array[];
}

export interface AudioSource {
  readonly name: string;
  readonly serialized: SerializedAudio;
}
