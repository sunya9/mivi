import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { expect, test, vi } from "vitest";

function createTestContext() {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  return canvas.getContext("2d")!;
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
  const ctx = createTestContext();
  const config = getDefaultRendererConfig().audioVisualizerConfig;
  const overlay = new AudioVisualizerOverlay(ctx, config);
  expect(overlay).toBeDefined();
});

test("should not render when style is none", () => {
  const ctx = createTestContext();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "none" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, config);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(createFrequencyData());

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should not render when frequencyData is null", () => {
  const ctx = createTestContext();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "bars" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, config);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(null);

  expect(ctx.save).not.toHaveBeenCalled();
  expect(ctx.restore).not.toHaveBeenCalled();
});

test("should call save and restore when rendering bars", () => {
  const ctx = createTestContext();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "bars" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, config);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("should call save and restore when rendering lineSpectrum", () => {
  const ctx = createTestContext();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "lineSpectrum" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, config);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("should call save and restore when rendering circular", () => {
  const ctx = createTestContext();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "circular" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, config);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(createFrequencyData());

  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});

test("setConfig should update config and propagate to drawers", () => {
  const ctx = createTestContext();
  const initialConfig = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    style: "none" as const,
  };
  const overlay = new AudioVisualizerOverlay(ctx, initialConfig);

  const newConfig = {
    ...initialConfig,
    style: "bars" as const,
  };
  overlay.setConfig(newConfig);

  ctx.save = vi.fn();
  ctx.restore = vi.fn();

  overlay.render(createFrequencyData());

  // Should now render since style changed from none to bars
  expect(ctx.save).toHaveBeenCalled();
  expect(ctx.restore).toHaveBeenCalled();
});
