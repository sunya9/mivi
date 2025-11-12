/* istanbul ignore file */

import { Muxer, MuxerOptions } from "@/lib/muxer/muxer";
import {
  Output,
  WebMOutputFormat,
  BufferTarget,
  EncodedVideoPacketSource,
  EncodedAudioPacketSource,
  EncodedPacket,
} from "mediabunny";

export class WebMMuxerImpl implements Muxer {
  private readonly output: Output<WebMOutputFormat, BufferTarget>;
  private readonly videoSource: EncodedVideoPacketSource;
  private readonly audioSource: EncodedAudioPacketSource;

  constructor(options: MuxerOptions) {
    this.output = new Output({
      format: new WebMOutputFormat(),
      target: new BufferTarget(),
    });

    this.videoSource = new EncodedVideoPacketSource("vp9");
    this.audioSource = new EncodedAudioPacketSource("opus");

    this.output.addVideoTrack(this.videoSource, {
      frameRate: options.frameRate,
    });
    this.output.addAudioTrack(this.audioSource);
  }

  get videoCodec() {
    return "vp09.00.10.08";
  }

  get audioCodec() {
    return "opus";
  }

  async addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): Promise<void> {
    const packet = EncodedPacket.fromEncodedChunk(chunk);
    await this.videoSource.add(packet, metadata);
  }

  async addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ): Promise<void> {
    const packet = EncodedPacket.fromEncodedChunk(chunk);
    await this.audioSource.add(packet, metadata);
  }

  async start(): Promise<void> {
    await this.output.start();
  }

  async finalize(): Promise<void> {
    await this.output.finalize();
  }

  get buffer(): ArrayBuffer {
    const buffer = this.output.target.buffer;
    if (!buffer) {
      throw new Error("Buffer not available - output not finalized");
    }
    return buffer;
  }
}
