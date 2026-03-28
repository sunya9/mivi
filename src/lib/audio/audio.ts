export interface SerializedAudio {
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  readonly channels: Float32Array[];
}

/** Serializable audio data for IndexedDB storage (duration is derived) */
export type StoredAudioData = Omit<SerializedAudio, "duration">;

export interface AudioSource {
  readonly name: string;
  readonly serialized: SerializedAudio;
}
