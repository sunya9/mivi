import { expect, test, vi } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer-overlay";
import {
  getDefaultRendererConfig,
  type AudioVisualizerConfig,
  type Resolution,
} from "@/lib/renderers/renderer";

const defaultResolution: Resolution = {
  width: 800,
  height: 600,
  label: "800×600",
};

function setup(overrides: Partial<AudioVisualizerConfig>) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  ctx.save = vi.fn<() => void>();
  ctx.restore = vi.fn<() => void>();
  const config = { ...getDefaultRendererConfig().audioVisualizerConfig, ...overrides };
  const render = (frequencyData: FrequencyData | null) =>
    drawAudioVisualizer(ctx, frequencyData, config, defaultResolution);
  return { ctx, config, render };
}

function createFrequencyData(): FrequencyData {
  return {
    frequencyData: new Uint8Array(1024).fill(128),
    timeDomainData: new Uint8Array(1024).fill(128),
    frequencyBinCount: 1024,
    nyquistFrequency: 22050,
  };
}

test("should not render when style is none", () => {
  const { ctx, render } = setup({ style: "none" });

  render(createFrequencyData());

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should not render when frequencyData is null", () => {
  const { ctx, render } = setup({ style: "bars" });

  render(null);

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test.each(["bars", "lineSpectrum", "circular"] as const)(
  "should call save and restore when rendering %s",
  (style) => {
    const { ctx, render } = setup({ style });

    render(createFrequencyData());

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  },
);

test("draws with the config passed to each call", () => {
  const { ctx, config } = setup({ style: "none" });

  drawAudioVisualizer(ctx, createFrequencyData(), { ...config, style: "bars" }, defaultResolution);

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});
