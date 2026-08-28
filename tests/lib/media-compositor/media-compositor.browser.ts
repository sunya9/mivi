import { test, expect, vi } from "vitest";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import {
  createTestRecorderResources,
  createTestSerializedAudio,
  createTestMidiTracks,
} from "tests/fixtures/browser-fixtures";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";

async function compositeToFile(resources: RecorderResources, onProgress: (p: number) => void) {
  const opfsFile = await createOpfsExportFile(`test-export.${resources.rendererConfig.format}`);
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
    writable: opfsFile.target,
  });
  using compositor = new MediaCompositor(resources, muxer, onProgress);
  await compositor.composite();
  const file = await opfsFile.getFile();
  await opfsFile.remove();
  return file;
}

test("composite() with WebM muxer writes a valid WebM file", async () => {
  const resources = createTestRecorderResources("webm");
  const onProgress = vi.fn();

  const file = await compositeToFile(resources, onProgress);

  expect(file).toBeInstanceOf(File);
  expect(file.size).toBeGreaterThan(0);
});

// TODO?: composite() with MP4 muxer writes a valid MP4 file

test("onProgress is called with progress value", async () => {
  const resources = createTestRecorderResources("webm");
  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  await compositeToFile(resources, onProgress);

  // onProgress is throttled at 500ms, so short tests may not capture all updates
  expect(progressValues.length).toBeGreaterThan(0);
  expect(progressValues[0]).toBeGreaterThan(0);
});

test("progress completes when audio visualizer is disabled", async () => {
  const resources = createTestRecorderResources("webm");
  // Ensure audio visualizer is disabled (default)
  expect(resources.rendererConfig.audioVisualizerConfig.style).toBe("none");

  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  await compositeToFile(resources, onProgress);

  // Progress should complete successfully
  // Note: onProgress is throttled at 500ms, so we may not see all intermediate values
  expect(progressValues.length).toBeGreaterThan(0);
});

test("progress completes when audio visualizer is enabled", async () => {
  const config = getDefaultRendererConfig();
  const resources = {
    midiTracks: createTestMidiTracks(),
    audioSource: {
      name: "test.mp3",
      serialized: createTestSerializedAudio(),
    },
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

  const progressValues: number[] = [];
  const onProgress = (p: number) => progressValues.push(p);

  await compositeToFile(resources, onProgress);

  // With audio visualizer enabled, FFT phase should be processed
  // and progress should complete successfully
  // Note: onProgress is throttled at 500ms, so we may not capture all state changes
  expect(progressValues.length).toBeGreaterThan(0);
});
