import { test, expect, vi, beforeEach } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer/audio-visualizer";
import { drawBackground } from "@/lib/renderers/background";
import { drawFrame } from "@/lib/renderers/draw-frame";
import { type Renderer } from "@/lib/renderers/renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

vi.mock("@/lib/renderers/background", () => ({ drawBackground: vi.fn<() => void>() }));
vi.mock("@/lib/renderers/audio-visualizer/audio-visualizer", () => ({
  drawAudioVisualizer: vi.fn<() => void>(),
}));

const mockDrawBackground = vi.mocked(drawBackground);
const mockDrawAudioVisualizer = vi.mocked(drawAudioVisualizer);
let ctx: CanvasRenderingContext2D;
let renderer: ReturnType<typeof vi.fn<Renderer>>;

function createFrequencyData(): FrequencyData {
  return {
    frequencyBinCount: 1024,
    frequencyData: new Uint8Array(1024),
    timeDomainData: new Uint8Array(1024),
    nyquistFrequency: 22050,
  };
}

beforeEach(() => {
  ctx = document.createElement("canvas").getContext("2d")!;
  renderer = vi.fn<Renderer>();
  mockDrawBackground.mockReset();
  mockDrawAudioVisualizer.mockReset();
});

test("draws the background with the bitmap and the MIDI layer with the config", () => {
  const config = getDefaultRendererConfig();
  const bitmap = {} as ImageBitmap;
  drawFrame(ctx, { config, renderer, tracks: [], currentTime: 1.5, backgroundImageBitmap: bitmap });
  expect(mockDrawBackground).toHaveBeenCalledExactlyOnceWith(ctx, config, bitmap);
  expect(renderer).toHaveBeenCalledExactlyOnceWith([], 1.5, config);
});

test.each(["front", "back"] as const)(
  "draws the audio visualizer on the %s layer when frequency data exists",
  (audioVisualizerLayer) => {
    const config = { ...getDefaultRendererConfig(), audioVisualizerLayer };
    const frequencyData = createFrequencyData();
    drawFrame(ctx, { config, renderer, tracks: [], currentTime: 0, frequencyData });
    expect(mockDrawAudioVisualizer).toHaveBeenCalledExactlyOnceWith(ctx, frequencyData, config);
  },
);

test.each([null, undefined])(
  "skips the audio visualizer when frequency data is %s",
  (frequencyData) => {
    const config = getDefaultRendererConfig();
    drawFrame(ctx, { config, renderer, tracks: [], currentTime: 0, frequencyData });
    expect(mockDrawAudioVisualizer).not.toHaveBeenCalled();
  },
);

test.each([
  { audioVisualizerLayer: "back" as const, order: ["background", "audioVisualizer", "midi"] },
  { audioVisualizerLayer: "front" as const, order: ["background", "midi", "audioVisualizer"] },
])(
  "layers $order when the visualizer is $audioVisualizerLayer",
  ({ audioVisualizerLayer, order }) => {
    const calls: string[] = [];
    mockDrawBackground.mockImplementation(() => {
      calls.push("background");
    });
    mockDrawAudioVisualizer.mockImplementation(() => {
      calls.push("audioVisualizer");
    });
    renderer.mockImplementation(() => {
      calls.push("midi");
    });
    const config = { ...getDefaultRendererConfig(), audioVisualizerLayer };
    drawFrame(ctx, {
      config,
      renderer,
      tracks: [],
      currentTime: 0,
      frequencyData: createFrequencyData(),
    });
    expect(calls).toEqual(order);
  },
);
