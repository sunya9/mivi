import {
  Mp4OutputFormat,
  WebMOutputFormat,
  type AudioCodec,
  type OutputFormat,
  type VideoCodec,
} from "mediabunny";

import { getH264CodecString } from "@/lib/muxer/h264-level";
import type { Resolution } from "@/lib/muxer/resolution";
import type { VideoFormat } from "@/lib/muxer/video-format";

export interface OutputFormatConfig {
  outputFormat: OutputFormat;
  videoCodec: VideoCodec;
  audioCodec: AudioCodec;
  videoCodecString: (resolution: Resolution, frameRate: number) => string;
}

export const OUTPUT_FORMATS: Record<VideoFormat, OutputFormatConfig> = {
  webm: {
    outputFormat: new WebMOutputFormat(),
    videoCodec: "vp9",
    audioCodec: "opus",
    videoCodecString: () => "vp09.00.41.08",
  },
  mp4: {
    outputFormat: new Mp4OutputFormat({ fastStart: false }),
    videoCodec: "avc",
    audioCodec: "aac",
    videoCodecString: getH264CodecString,
  },
};
