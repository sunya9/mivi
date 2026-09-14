import { expose } from "comlink";

import { type ExportPhase, MediaCompositor } from "@/lib/media-compositor/media-compositor";

import { ExportProgressTracker, type ActivePhase } from "./export-progress-tracker";
import { createOpfsExportFile } from "./opfs-target";
import { RecorderResources } from "./recorder-resources";

export async function startRecording(
  resources: RecorderResources,
  onProgress: (progress: number, activePhase?: ActivePhase<ExportPhase>) => void,
) {
  const opfsFile = await createOpfsExportFile(`export.${resources.rendererConfig.format}`);
  using mediaCompositor = new MediaCompositor(resources, opfsFile.target);
  const progress = new ExportProgressTracker(mediaCompositor.phases, onProgress);
  mediaCompositor.subscribe((phase, completed) => progress.set(phase, completed));
  await mediaCompositor.composite();
  return await opfsFile.getFile();
}

expose({ startRecording });
