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
  // Fixed name: each export truncates the previous file, so the OPFS staging
  // area is self-cleaning without tracking download completion
  const opfsFile = await createOpfsExportFile(`export.${format}`);
  const muxer = new MuxerImpl({
    format,
    frameRate: resources.rendererConfig.fps,
    writable: opfsFile.target,
  });
  using mediaCompositor = new MediaCompositor(resources, muxer, onProgress);
  await mediaCompositor.composite();
  // The returned File only references disk; the main thread can hand it to
  // URL.createObjectURL without loading the content into memory
  return await opfsFile.getFile();
}

expose({ startRecording });
