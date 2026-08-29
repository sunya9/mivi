import { expose } from "comlink";

import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { MuxerImpl } from "@/lib/muxer/muxer";

import type { ActivePhase } from "./export-progress-tracker";
import { createOpfsExportFile } from "./opfs-target";
import { RecorderResources } from "./recorder-resources";

export async function startRecording(
  resources: RecorderResources,
  onProgress: (progress: number, activePhase?: ActivePhase) => void,
) {
  const format = resources.rendererConfig.format;
  const opfsFile = await createOpfsExportFile(`export.${format}`);
  const muxer = new MuxerImpl({
    format,
    frameRate: resources.rendererConfig.fps,
    writable: opfsFile.target,
  });
  using mediaCompositor = new MediaCompositor(resources, muxer, onProgress);
  await mediaCompositor.composite();
  return await opfsFile.getFile();
}

expose({ startRecording });
