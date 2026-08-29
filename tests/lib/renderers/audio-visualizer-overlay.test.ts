import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import {
  getDefaultRendererConfig,
  type AudioVisualizerConfig,
  type Resolution,
} from "@/lib/renderers/renderer";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { expect, test, vi } from "vitest";

const defaultResolution: Resolution = {
  width: 800,
  height: 600,
  label: "800×600",
};

function createOverlay(config: AudioVisualizerConfig) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  ctx.save = vi.fn<() => void>();
  ctx.restore = vi.fn<() => void>();
  const overlay = new AudioVisualizerOverlay(ctx, config, defaultResolution);
  return { ctx, overlay };
}

function createFrequencyData(): FrequencyData {
  return {
    frequencyData: new Uint8Array(1024).fill(128),
    timeDomainData: new Uint8Array(1024).fill(128),
    frequencyBinCount: 1024,
    nyquistFrequency: 22050,
  };
}

test("should create overlay with default config", () => {
  const { overlay } = createOverlay(getDefaultRendererConfig().audioVisualizerConfig);
  expect(overlay).toBeDefined();
});

test("should not render when style is none", () => {
  const { ctx, overlay } = createOverlay({
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "none" as const,
  });

  overlay.render(createFrequencyData());

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should not render when frequencyData is null", () => {
  const { ctx, overlay } = createOverlay({
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "bars" as const,
  });

  overlay.render(null);

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should call save and restore when rendering bars", () => {
  const { ctx, overlay } = createOverlay({
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "bars" as const,
  });

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("should call save and restore when rendering lineSpectrum", () => {
  const { ctx, overlay } = createOverlay({
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "lineSpectrum" as const,
  });

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("should call save and restore when rendering circular", () => {
  const { ctx, overlay } = createOverlay({
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "circular" as const,
  });

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("setConfig should update config and propagate to drawers", () => {
  const initialConfig = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "none" as const,
  };
  const { ctx, overlay } = createOverlay(initialConfig);

  const newConfig = {
    ...initialConfig,
    style: "bars" as const,
  };
  overlay.setConfig(newConfig);

  overlay.render(createFrequencyData());

  // Should now render since style changed from none to bars
  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});
