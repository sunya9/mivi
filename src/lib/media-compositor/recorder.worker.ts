import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { expose } from "comlink";
import { RecorderResources } from "./recorder-resources";
import type { ActivePhase } from "./export-progress-tracker";

export async function startRecording(
  resources: RecorderResources,
  onProgress: (progress: number, activePhase?: ActivePhase) => void,
) {
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  using mediaCompositor = new MediaCompositor(resources, muxer, onProgress);
  const response = await mediaCompositor.composite();
  return response;
}

expose({ startRecording });
