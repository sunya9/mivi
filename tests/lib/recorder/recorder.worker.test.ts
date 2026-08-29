import type { StreamTargetChunk } from "mediabunny";
import { resources } from "tests/fixtures";
import { test, expect, vi } from "vitest";

import type { ActivePhase } from "@/lib/media-compositor/export-progress-tracker";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { startRecording } from "@/lib/media-compositor/recorder.worker";
import { MuxerImpl } from "@/lib/muxer/muxer";

vi.mock("@/lib/muxer/muxer");
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

test("should create MuxerImpl with mp4 format", async () => {
  await startRecording(resources, mockOnProgress);

  expect(createOpfsExportFile).toHaveBeenCalledWith("export.mp4");
  expect(MuxerImpl).toHaveBeenCalledExactlyOnceWith({
    format: "mp4",
    frameRate: resources.rendererConfig.fps,
    writable: mockOpfsFile.target,
  });
});

test("should create MuxerImpl with webm format", async () => {
  const webmResources: RecorderResources = {
    ...resources,
    rendererConfig: {
      ...resources.rendererConfig,
      format: "webm",
    },
  };

  await startRecording(webmResources, mockOnProgress);

  expect(MuxerImpl).toHaveBeenCalledWith({
    format: "webm",
    frameRate: webmResources.rendererConfig.fps,
    writable: mockOpfsFile.target,
  });
});

test("should return the OPFS-backed file after compositing", async () => {
  MediaCompositor.prototype.composite = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const result = await startRecording(resources, mockOnProgress);

  expect(MediaCompositor.prototype.composite).toHaveBeenCalledOnce();
  expect(result).toBe(mockFile);
});
