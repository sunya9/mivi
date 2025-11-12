export interface Muxer {
  addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): Promise<void>;
  addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ): Promise<void>;

  start(): Promise<void>;

  finalize(): Promise<void>;
  get buffer(): ArrayBuffer;
  get videoCodec(): string;
  get audioCodec(): string;
}

export interface MuxerOptions {
  width: number;
  height: number;
  frameRate: number;
  numberOfChannels: number;
  sampleRate: number;
}
