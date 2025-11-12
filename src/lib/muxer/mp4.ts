/* istanbul ignore file */

import { Muxer, MuxerOptions } from "./muxer";
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  EncodedVideoPacketSource,
  EncodedAudioPacketSource,
  EncodedPacket,
} from "mediabunny";

export class MP4MuxerImpl implements Muxer {
  private readonly output: Output<Mp4OutputFormat, BufferTarget>;
  private readonly videoSource: EncodedVideoPacketSource;
  private readonly audioSource: EncodedAudioPacketSource;

  constructor(options: MuxerOptions) {
    this.output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new BufferTarget(),
    });

    this.videoSource = new EncodedVideoPacketSource("avc");
    this.audioSource = new EncodedAudioPacketSource("aac");

    this.output.addVideoTrack(this.videoSource, {
      frameRate: options.frameRate,
    });
    this.output.addAudioTrack(this.audioSource);
  }

  get videoCodec() {
    return "avc1.42001f";
  }

  get audioCodec() {
    return "mp4a.40.2";
  }

  async start(): Promise<void> {
    await this.output.start();
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
