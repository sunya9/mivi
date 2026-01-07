/* istanbul ignore file */

import {
  Output,
  WebMOutputFormat,
  Mp4OutputFormat,
  BufferTarget,
  EncodedVideoPacketSource,
  EncodedAudioPacketSource,
  EncodedPacket,
  OutputFormat,
  VideoCodec,
  AudioCodec,
} from "mediabunny";
import { VideoFormat } from "../renderers/renderer";

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
  get mimeType(): string;
}

const FORMAT_CONFIGS: Record<
  VideoFormat,
  {
    createOutputFormat: () => OutputFormat;
    videoCodecId: VideoCodec;
    audioCodecId: AudioCodec;
    videoCodec: string;
    audioCodec: string;
    mimeType: string;
  }
> = {
  webm: {
    createOutputFormat: () => new WebMOutputFormat(),
    videoCodecId: "vp9" as const,
    audioCodecId: "opus" as const,
    videoCodec: "vp09.00.10.08",
    audioCodec: "opus",
    mimeType: "video/webm",
  },
  mp4: {
    createOutputFormat: () => new Mp4OutputFormat({ fastStart: "in-memory" }),
    videoCodecId: "avc" as const,
    audioCodecId: "aac" as const,
    videoCodec: "avc1.42001f",
    audioCodec: "mp4a.40.2",
    mimeType: "video/mp4",
  },
} as const;

export interface MuxerOptions {
  format: VideoFormat;
  frameRate: number;
}

export class MuxerImpl implements Muxer {
  readonly #output: Output<OutputFormat, BufferTarget>;
  readonly #videoSource: EncodedVideoPacketSource;
  readonly #audioSource: EncodedAudioPacketSource;
  readonly #videoCodec: string;
  readonly #audioCodec: string;
  readonly #mimeType: string;

  constructor(options: MuxerOptions) {
    const config = FORMAT_CONFIGS[options.format];

    this.#output = new Output({
      format: config.createOutputFormat(),
      target: new BufferTarget(),
    });

    this.#videoSource = new EncodedVideoPacketSource(config.videoCodecId);
    this.#audioSource = new EncodedAudioPacketSource(config.audioCodecId);
    this.#videoCodec = config.videoCodec;
    this.#audioCodec = config.audioCodec;
    this.#mimeType = config.mimeType;

    this.#output.addVideoTrack(this.#videoSource, {
      frameRate: options.frameRate,
    });
    this.#output.addAudioTrack(this.#audioSource);
  }

  get videoCodec() {
    return this.#videoCodec;
  }

  get audioCodec() {
    return this.#audioCodec;
  }

  get mimeType() {
    return this.#mimeType;
  }

  async addVideoChunk(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): Promise<void> {
    const packet = EncodedPacket.fromEncodedChunk(chunk);
    await this.#videoSource.add(packet, metadata);
  }

  async addAudioChunk(
    chunk: EncodedAudioChunk,
    metadata?: EncodedAudioChunkMetadata,
  ): Promise<void> {
    const packet = EncodedPacket.fromEncodedChunk(chunk);
    await this.#audioSource.add(packet, metadata);
  }

  async start(): Promise<void> {
    await this.#output.start();
  }

  async finalize(): Promise<void> {
    await this.#output.finalize();
  }

  get buffer(): ArrayBuffer {
    const buffer = this.#output.target.buffer;
    if (!buffer) {
      throw new Error("Buffer not available - output not finalized");
    }
    return buffer;
  }
}
