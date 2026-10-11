import { expect, test, vi } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer/audio-visualizer";
import { getDefaultRendererConfig, type RendererConfig } from "@/lib/renderers/renderer-config";

function setup(overrides: Partial<RendererConfig>) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  ctx.save = vi.fn<() => void>();
  ctx.restore = vi.fn<() => void>();
  const config = { ...getDefaultRendererConfig(), ...overrides };
  const render = (frequencyData: FrequencyData | null) =>
    drawAudioVisualizer(ctx, frequencyData, config);
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
  const { ctx, render } = setup({ audioVisualizerStyle: "none" });

  render(createFrequencyData());

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should not render when frequencyData is null", () => {
  const { ctx, render } = setup({ audioVisualizerStyle: "bars" });

  render(null);

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test.each(["bars", "lineSpectrum", "circular"] as const)(
  "should call save and restore when rendering %s",
  (audioVisualizerStyle) => {
    const { ctx, render } = setup({ audioVisualizerStyle });

    render(createFrequencyData());

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  },
);

test("draws with the config passed to each call", () => {
  const { ctx, config } = setup({ audioVisualizerStyle: "none" });

  drawAudioVisualizer(ctx, createFrequencyData(), { ...config, audioVisualizerStyle: "bars" });

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});
