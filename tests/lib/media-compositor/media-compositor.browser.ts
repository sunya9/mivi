import {
  createTestRecorderResources,
  createTestSerializedAudio,
  createTestMidiTracks,
} from "tests/fixtures/browser-fixtures";
import { test, expect } from "vitest";

import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

async function compositeToFile(resources: RecorderResources) {
  const opfsFile = await createOpfsExportFile(`test-export.${resources.rendererConfig.format}`);
  const muxer = new MuxerImpl({
    format: resources.rendererConfig.format,
    frameRate: resources.rendererConfig.fps,
    writable: opfsFile.target,
  });
  using compositor = new MediaCompositor(resources, muxer);
  const completed = new Map<string, number>();
  compositor.subscribe((phase, count) => completed.set(phase, count));
  await compositor.composite();
  const file = await opfsFile.getFile();
  await opfsFile.remove();
  return { file, phases: compositor.phases, completed };
}

function createVisualizerResources(): RecorderResources {
  const config = getDefaultRendererConfig();
  return {
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
}

test("composite() with WebM muxer writes a valid WebM file", async () => {
  const resources = createTestRecorderResources("webm");

  const { file } = await compositeToFile(resources);

  expect(file).toBeInstanceOf(File);
  expect(file.size).toBeGreaterThan(0);
});

// TODO?: composite() with MP4 muxer writes a valid MP4 file

test("every phase reports its total once composite finishes", async () => {
  const resources = createTestRecorderResources("webm");
  expect(resources.rendererConfig.audioVisualizerConfig.style).toBe("none");

  const { phases, completed } = await compositeToFile(resources);

  expect(phases.map((p) => p.name)).toEqual([
    "FFT",
    "Audio Render",
    "Audio Encode",
    "Video Render",
    "Video Encode",
  ]);
  for (const phase of phases) {
    expect(phase.total).toBeGreaterThan(0);
    expect(completed.get(phase.name)).toBe(phase.total);
  }
});

test("FFT phase progresses frame by frame when the audio visualizer is enabled", async () => {
  const seen: number[] = [];
  const resources = createVisualizerResources();
  const opfsFile = await createOpfsExportFile("test-export.webm");
  const muxer = new MuxerImpl({ format: "webm", frameRate: 24, writable: opfsFile.target });
  using compositor = new MediaCompositor(resources, muxer);
  compositor.subscribe((phase, count) => {
    if (phase === "FFT") seen.push(count);
  });

  await compositor.composite();
  await opfsFile.remove();

  const fft = compositor.phases.find((p) => p.name === "FFT");
  expect(seen).toHaveLength(fft?.total ?? 0);
  expect(seen.at(-1)).toBe(fft?.total);
});
