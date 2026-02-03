import { test, expect, vi } from "vitest";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import {
  createTestRecorderResources,
  createTestSerializedAudio,
  createTestMidiTracks,
} from "tests/fixtures/browser-fixtures";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";

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

test.todo("composite() with MP4 muxer returns a valid MP4 Blob");

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

test("progress completes when audio visualizer is disabled", async () => {
  const resources = createTestRecorderResources("webm");
  // Ensure audio visualizer is disabled (default)
  expect(resources.rendererConfig.audioVisualizerConfig.style).toBe("none");

  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  using compositor = new MediaCompositor(resources, muxer, onProgress);
  await compositor.composite();

  // Progress should complete successfully
  // Note: onProgress is throttled at 500ms, so we may not see all intermediate values
  expect(progressValues.length).toBeGreaterThan(0);
});

test("progress completes when audio visualizer is enabled", async () => {
  const config = getDefaultRendererConfig();
  const resources = {
    midiTracks: createTestMidiTracks(),
    serializedAudio: createTestSerializedAudio(),
    rendererConfig: {
      ...config,
      resolution: { width: 320, height: 240, label: "320×240 (4:3)" },
      fps: 24 as const,
      format: "webm" as const,
      audioVisualizerConfig: {
        ...config.audioVisualizerConfig,
        style: "bars" as const,
      },
    },
  };

  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
  });
  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  using compositor = new MediaCompositor(resources, muxer, onProgress);
  await compositor.composite();

  // With audio visualizer enabled, FFT phase should be processed
  // and progress should complete successfully
  // Note: onProgress is throttled at 500ms, so we may not capture all state changes
  expect(progressValues.length).toBeGreaterThan(0);
});
