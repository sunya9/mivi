import type { StreamTargetChunk } from "mediabunny";
import { resources } from "tests/fixtures";
import { test, expect, vi } from "vitest";

import type { ActivePhase } from "@/lib/media-compositor/export-progress-tracker";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { startRecording } from "@/lib/media-compositor/recorder.worker";

vi.mock("@/lib/media-compositor/media-compositor");
vi.mock("@/lib/media-compositor/opfs-target");

const mockOnProgress = vi.fn<(progress: number, activePhase?: ActivePhase) => void>();
const mockFile = new File(["test"], "export.webm", { type: "video/webm" });
const mockOpfsFile = {
  target: new WritableStream<StreamTargetChunk>(),
  getFile: vi.fn<() => Promise<File>>().mockResolvedValue(mockFile),
  remove: vi.fn<() => Promise<void>>(),
};
vi.mocked(createOpfsExportFile).mockResolvedValue(mockOpfsFile);

test("names the OPFS export file after the mp4 format", async () => {
  await startRecording(resources, mockOnProgress);

  expect(createOpfsExportFile).toHaveBeenCalledWith("export.mp4");
});

test("names the OPFS export file after the webm format", async () => {
  const webmResources: RecorderResources = {
    ...resources,
    rendererConfig: {
      ...resources.rendererConfig,
      format: "webm",
    },
  };

  await startRecording(webmResources, mockOnProgress);

  expect(createOpfsExportFile).toHaveBeenCalledWith("export.webm");
});

test("hands the OPFS target to the compositor", async () => {
  await startRecording(resources, mockOnProgress);

  expect(MediaCompositor).toHaveBeenCalledWith(resources, mockOpfsFile.target);
});

test("returns the OPFS-backed file after compositing", async () => {
  MediaCompositor.prototype.composite = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const result = await startRecording(resources, mockOnProgress);

  expect(MediaCompositor.prototype.composite).toHaveBeenCalledOnce();
  expect(result).toBe(mockFile);
});
