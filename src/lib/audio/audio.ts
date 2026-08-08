export interface SerializedAudio {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  // 16-bit PCM: halves resident memory vs f32 with no audible cost, since both
  // the decode source and the encode destination are lossy formats
  readonly channels: Int16Array[];
}

/** Serializable audio data for IndexedDB storage (duration is derived) */
export type StoredAudioData = Omit<SerializedAudio, "duration">;

export interface AudioSource {
  readonly name: string;
  readonly serialized: SerializedAudio;
}
