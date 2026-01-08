import { test, expect, vi } from "vitest";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createTestRecorderResources } from "tests/fixtures/browser-fixtures";
import { MuxerImpl } from "@/lib/muxer/muxer";

async function isMp4CodecSupported(): Promise<boolean> {
  const videoSupport = await VideoEncoder.isConfigSupported({
    codec: "avc1.42E029",
    width: 1920,
    height: 1080,
    bitrate: 10_000_000,
    framerate: 30,
  });
  const audioSupport = await AudioEncoder.isConfigSupported({
    codec: "mp4a.40.2",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitrate: 192_000,
  });
  return !!videoSupport.supported && !!audioSupport.supported;
}

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

test("composite() with MP4 muxer returns a valid MP4 Blob", async (ctx) => {
  if (!(await isMp4CodecSupported())) {
    ctx.skip();
  }

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
  const resources = createTestRecorderResources("webm");
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
