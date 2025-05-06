import { test, expect, vi, beforeEach } from "vitest";
import { startRecording } from "@/lib/media-compositor/recorder.worker";
import { MP4Muxer, WebMMuxer } from "@/lib/muxer";
import { resources } from "tests/fixtures";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";

vi.mock("@/lib/muxer");
vi.mock("@/lib/media-compositor/media-compositor");

const mockOnProgress = vi.fn();
const mockBlob = new Blob(["test"], { type: "video/webm" });

beforeEach(() => {
  vi.clearAllMocks();
});

test("should create WebMMuxer when format is webm", async () => {
  await startRecording(resources, mockOnProgress);

  expect(WebMMuxer).toHaveBeenCalledWith({
    frameRate: resources.rendererConfig.fps,
    width: resources.rendererConfig.resolution.width,
    height: resources.rendererConfig.resolution.height,
    numberOfChannels: resources.serializedAudio.numberOfChannels,
    sampleRate: resources.serializedAudio.sampleRate,
  });
  expect(MP4Muxer).not.toHaveBeenCalled();
});

test("should create MP4Muxer when format is mp4", async () => {
  const mp4Resources: RecorderResources = {
    ...resources,
    rendererConfig: {
      ...resources.rendererConfig,
      format: "mp4",
    },
  };

  await startRecording(mp4Resources, mockOnProgress);

  expect(MP4Muxer).toHaveBeenCalledWith({
    frameRate: mp4Resources.rendererConfig.fps,
    width: mp4Resources.rendererConfig.resolution.width,
    height: mp4Resources.rendererConfig.resolution.height,
    numberOfChannels: mp4Resources.serializedAudio.numberOfChannels,
    sampleRate: mp4Resources.serializedAudio.sampleRate,
  });
  expect(WebMMuxer).not.toHaveBeenCalled();
});

test("should return blob from MediaCompositor", async () => {
  MediaCompositor.prototype.composite = vi.fn().mockResolvedValue(mockBlob);
  const result = await startRecording(resources, mockOnProgress);

  expect(result).toBe(mockBlob);
});
