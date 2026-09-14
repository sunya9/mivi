import { ALL_FORMATS, BlobSource, Input } from "mediabunny";
import {
  createTestAudioFile,
  createTestRecorderResources,
  createTestSerializedAudio,
  createTestMidiTracks,
} from "tests/fixtures/browser-fixtures";
import { test, expect } from "vitest";

import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

async function compositeToFile(resources: RecorderResources) {
  const opfsFile = await createOpfsExportFile(`test-export.${resources.rendererConfig.format}`);
  using compositor = new MediaCompositor(resources, opfsFile.target);
  const completed = new Map<string, number>();
  compositor.subscribe((phase, count) => completed.set(phase, count));
  await compositor.composite();
  const opfsBacked = await opfsFile.getFile();
  const file = new File([await opfsBacked.arrayBuffer()], opfsBacked.name);
  await opfsFile.remove();
  return { file, phases: compositor.phases, completed };
}

async function createVisualizerResources(): Promise<RecorderResources> {
  const config = getDefaultRendererConfig();
  const serialized = createTestSerializedAudio();
  return {
    midiTracks: createTestMidiTracks(),
    audioSource: {
      name: "test.wav",
      file: await createTestAudioFile(serialized),
      serialized,
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

test.each([
  { format: "webm", audioCodec: "opus" },
  { format: "mp4", audioCodec: "pcm-s16" },
] as const)(
  "composite() writes a readable $format file, carrying the audio as $audioCodec",
  async ({ format, audioCodec }) => {
    const resources = await createTestRecorderResources(format);
    const { fps, resolution } = resources.rendererConfig;
    const { duration, numberOfChannels } = resources.audioSource.serialized;

    const { file, phases } = await compositeToFile(resources);

    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    expect(video?.codedWidth).toBe(resolution.width);
    expect(video?.codedHeight).toBe(resolution.height);
    expect((await video?.computePacketStats())?.packetCount).toBe(
      phases.find((p) => p.name === "Video Encode")?.total,
    );
    expect(await video?.computeDuration()).toBeCloseTo(Math.ceil(duration * fps) / fps, 2);
    expect(audio?.codec).toBe(audioCodec);
    expect(audio?.numberOfChannels).toBe(numberOfChannels);
    const audioDuration = await audio?.computeDuration();
    expect(audioDuration).toBeGreaterThan(duration - 0.1);
    expect(audioDuration).toBeLessThan(duration + 0.1);
  },
);

test("every phase reports its total once composite finishes", async () => {
  const resources = await createTestRecorderResources("webm");
  expect(resources.rendererConfig.audioVisualizerConfig.style).toBe("none");

  const { phases, completed } = await compositeToFile(resources);

  expect(phases.map((p) => p.name)).toEqual(["FFT", "Audio", "Video Render", "Video Encode"]);
  for (const phase of phases) {
    expect(phase.total).toBeGreaterThan(0);
    expect(completed.get(phase.name)).toBe(phase.total);
  }
});

test("FFT phase progresses frame by frame when the audio visualizer is enabled", async () => {
  const seen: number[] = [];
  const resources = await createVisualizerResources();
  const opfsFile = await createOpfsExportFile("test-export.webm");
  using compositor = new MediaCompositor(resources, opfsFile.target);
  compositor.subscribe((phase, count) => {
    if (phase === "FFT") seen.push(count);
  });

  await compositor.composite();
  await opfsFile.remove();

  const fft = compositor.phases.find((p) => p.name === "FFT");
  expect(seen).toHaveLength(fft?.total ?? 0);
  expect(seen.at(-1)).toBe(fft?.total);
});
