import { test, expect, vi } from "vitest";
import { startRecording } from "@/lib/media-compositor/recorder.worker";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { resources } from "tests/fixtures";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import type { StreamTargetChunk } from "mediabunny";

vi.mock("@/lib/muxer/muxer");
vi.mock("@/lib/media-compositor/media-compositor");
vi.mock("@/lib/media-compositor/opfs-target");

const mockOnProgress = vi.fn();
const mockFile = new File(["test"], "export.webm", { type: "video/webm" });
const mockOpfsFile = {
  target: new WritableStream<StreamTargetChunk>(),
  getFile: vi.fn().mockResolvedValue(mockFile),
  remove: vi.fn(),
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
  MediaCompositor.prototype.composite = vi.fn().mockResolvedValue(undefined);
  const result = await startRecording(resources, mockOnProgress);

  expect(MediaCompositor.prototype.composite).toHaveBeenCalledOnce();
  expect(result).toBe(mockFile);
});
