/* istanbul ignore file */

import {
  Output,
  WebMOutputFormat,
  Mp4OutputFormat,
  StreamTarget,
  StreamTargetChunk,
  EncodedVideoPacketSource,
  EncodedAudioPacketSource,
  EncodedPacket,
  OutputFormat,
  VideoCodec,
  AudioCodec,
} from "mediabunny";
import { VideoFormat } from "../renderers/renderer";

interface Config {
  outputFormat: OutputFormat;
  videoCodecId: VideoCodec;
  audioCodecId: AudioCodec;
  videoCodec: string;
  audioCodec: string;
  mimeType: string;
}

export interface Muxer {
  config: Config;
  addVideoChunk(chunk: EncodedVideoChunk, metadata?: EncodedVideoChunkMetadata): Promise<void>;
  addAudioChunk(chunk: EncodedAudioChunk, metadata?: EncodedAudioChunkMetadata): Promise<void>;

  start(): Promise<void>;

  finalize(): Promise<void>;
}

const FORMAT_CONFIGS: Record<VideoFormat, Config> = {
  webm: {
    outputFormat: new WebMOutputFormat(),
    videoCodecId: "vp9" as const,
    audioCodecId: "opus" as const,
    videoCodec: "vp09.00.41.08",
    audioCodec: "opus",
    mimeType: "video/webm",
  },
  mp4: {
    // fastStart "in-memory" would buffer the whole file in RAM and defeat
    // streaming. moov lands at the end instead, which positioned writes
    // handle fine on a seekable target like OPFS.
    outputFormat: new Mp4OutputFormat({ fastStart: false }),
    videoCodecId: "avc" as const,
    audioCodecId: "aac" as const,
    videoCodec: "avc1.42E029",
    audioCodec: "mp4a.40.2",
    mimeType: "video/mp4",
  },
} as const;

interface MuxerOptions {
  format: VideoFormat;
  frameRate: number;
  writable: WritableStream<StreamTargetChunk>;
}

export class MuxerImpl implements Muxer {
  readonly #output: Output<OutputFormat, StreamTarget>;
  readonly #videoSource: EncodedVideoPacketSource;
  readonly #audioSource: EncodedAudioPacketSource;
  readonly config: Config;
  constructor(options: MuxerOptions) {
    const config = FORMAT_CONFIGS[options.format];
    this.config = config;
    this.#output = new Output({
      format: config.outputFormat,
      target: new StreamTarget(options.writable),
    });

    this.#videoSource = new EncodedVideoPacketSource(config.videoCodecId);
    this.#audioSource = new EncodedAudioPacketSource(config.audioCodecId);

    this.#output.addVideoTrack(this.#videoSource, {
      frameRate: options.frameRate,
    });
    this.#output.addAudioTrack(this.#audioSource);
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
}
