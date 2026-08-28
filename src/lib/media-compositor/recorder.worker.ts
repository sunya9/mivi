import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { createOpfsExportFile } from "./opfs-target";
import { expose } from "comlink";
import { RecorderResources } from "./recorder-resources";
import type { ActivePhase } from "./export-progress-tracker";

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
