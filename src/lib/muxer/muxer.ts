import { ArrayBufferTarget } from "webm-muxer";

export interface Muxer {
  addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): void;
  addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ): void;

  finalize(): void;
  get buffer(): ArrayBuffer;
  get videoCodec(): string;
  get audioCodec(): string;
}

export interface MuxerOptions {
  target: ArrayBufferTarget;
  width: number;
  height: number;
  frameRate: number;
  numberOfChannels: number;
  sampleRate: number;
}
