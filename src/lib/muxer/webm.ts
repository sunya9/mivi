/* istanbul ignore file */

import { Muxer, MuxerOptions } from "@/lib/muxer/muxer";
import { Muxer as WebMMuxer, ArrayBufferTarget } from "webm-muxer";

export class WebMMuxerImpl implements Muxer {
  private readonly muxer: WebMMuxer<ArrayBufferTarget>;
  constructor(options: MuxerOptions) {
    this.muxer = new WebMMuxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: "V_VP9",
        width: options.width,
        height: options.height,
        frameRate: options.frameRate,
      },
      audio: {
        codec: "A_OPUS",
        numberOfChannels: options.numberOfChannels,
        sampleRate: options.sampleRate,
      },
    });
  }

  get videoCodec() {
    return "vp09.00.10.08";
  }

  get audioCodec() {
    return "opus";
  }

  addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): void {
    this.muxer.addVideoChunk(chunk, metadata);
  }

  addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ): void {
    this.muxer.addAudioChunk(chunk, metadata);
  }

  finalize(): void {
    this.muxer.finalize();
  }

  get buffer(): ArrayBuffer {
    return this.muxer.target.buffer;
  }
}
