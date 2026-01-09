import { test, expect, vi } from "vitest";
import { startRecording } from "@/lib/media-compositor/recorder.worker";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { resources } from "tests/fixtures";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";

vi.mock("@/lib/muxer/muxer");
vi.mock("@/lib/media-compositor/media-compositor");

const mockOnProgress = vi.fn();
const mockBlob = new Blob(["test"], { type: "video/webm" });

test("should create MuxerImpl with mp4 format", async () => {
  await startRecording(resources, mockOnProgress);

  expect(MuxerImpl).toHaveBeenCalledExactlyOnceWith({
    format: "mp4",
    frameRate: resources.rendererConfig.fps,
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
  });
});

test("should return blob from MediaCompositor", async () => {
  MediaCompositor.prototype.composite = vi.fn().mockResolvedValue(mockBlob);
  const result = await startRecording(resources, mockOnProgress);

  expect(result).toBe(mockBlob);
});
