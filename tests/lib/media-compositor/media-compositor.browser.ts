import { test, expect, vi } from "vitest";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createTestRecorderResources } from "tests/fixtures/browser-fixtures";
import { MuxerImpl } from "@/lib/muxer/muxer";

test("composite() with WebM muxer returns a valid WebM Blob", async () => {
  const resources = createTestRecorderResources("webm");
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  const onProgress = vi.fn();

  using compositor = new MediaCompositor(resources, muxer, onProgress);
  const blob = await compositor.composite();

  expect(blob).toBeInstanceOf(Blob);
  expect(blob.type).toBe("video/webm");
  expect(blob.size).toBeGreaterThan(0);
});

test("composite() with MP4 muxer returns a valid MP4 Blob", async () => {
  const resources = createTestRecorderResources("mp4");
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  const onProgress = vi.fn();

  using compositor = new MediaCompositor(resources, muxer, onProgress);
  const blob = await compositor.composite();

  expect(blob).toBeInstanceOf(Blob);
  expect(blob.type).toBe("video/mp4");
  expect(blob.size).toBeGreaterThan(0);
});

test("onProgress is called with progress value", async () => {
  const resources = createTestRecorderResources("mp4");
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  using compositor = new MediaCompositor(resources, muxer, onProgress);
  await compositor.composite();

  // onProgress is throttled at 500ms, so short tests may not capture all updates
  expect(progressValues.length).toBeGreaterThan(0);
  expect(progressValues[0]).toBeGreaterThan(0);
});
