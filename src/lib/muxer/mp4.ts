import { Muxer as Mp4Muxer, ArrayBufferTarget } from "mp4-muxer";
import { Muxer, MuxerOptions } from "./muxer";

export class MP4MuxerImpl implements Muxer {
  private readonly muxer: Mp4Muxer<ArrayBufferTarget>;
  constructor(options: MuxerOptions) {
    this.muxer = new Mp4Muxer({
      target: new ArrayBufferTarget(),
      audio: {
        codec: "aac",
        numberOfChannels: options.numberOfChannels,
        sampleRate: options.sampleRate,
      },
      video: {
        width: options.width,
        height: options.height,
        codec: "avc",
        frameRate: options.frameRate,
      },
      fastStart: "in-memory",
    });
  }

  get videoCodec() {
    return "avc1.42001f";
  }

  get audioCodec() {
    return "mp4a.40.2";
  }

  addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ) {
    this.muxer.addVideoChunk(chunk, metadata);
  }

  addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ) {
    this.muxer.addAudioChunk(chunk, metadata);
  }

  finalize() {
    this.muxer.finalize();
  }

  get buffer() {
    return this.muxer.target.buffer;
  }
}
