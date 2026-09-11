import { expect, test, vi } from "vitest";

import { createNoiseTexture } from "@/lib/renderers/shared/noise-texture";

const enabled = {
  showNoiseTexture: true,
  noiseIntensity: 0.15,
  noiseGrainSize: 4,
  noiseColorVariance: 30,
};

class FakeOffscreenCanvas {
  getContext() {
    return document.createElement("canvas").getContext("2d");
  }
}
vi.stubGlobal("OffscreenCanvas", FakeOffscreenCanvas);

function setup() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.createPattern = vi
    .fn<(image: CanvasImageSource, repetition: string | null) => CanvasPattern | null>()
    .mockImplementation(() => ({ setTransform: vi.fn<(transform?: DOMMatrix2DInit) => void>() }));
  return { ctx, noise: createNoiseTexture(ctx) };
}

test("does nothing while the texture is disabled", () => {
  const { ctx, noise } = setup();
  noise.apply({ ...enabled, showNoiseTexture: false }, "#204080", 0, 0, 1);
  expect(ctx.createPattern).not.toHaveBeenCalled();
  expect(ctx.fill).not.toHaveBeenCalled();
});

test("builds a light and a dark pattern once and reuses them across notes", () => {
  const { ctx, noise } = setup();
  noise.apply(enabled, "#204080", 0, 0, 1);
  noise.apply(enabled, "#f0f0f0", 10, 10, 2);
  expect(ctx.createPattern).toHaveBeenCalledTimes(2);
  expect(ctx.fill).toHaveBeenCalledTimes(2);
});

test("rebuilds the patterns when the noise settings change", () => {
  const { ctx, noise } = setup();
  noise.apply(enabled, "#204080", 0, 0, 1);
  noise.apply({ ...enabled, noiseGrainSize: 8 }, "#204080", 0, 0, 1);
  expect(ctx.createPattern).toHaveBeenCalledTimes(4);
});

test("rebuilds the patterns after being disabled and enabled again", () => {
  const { ctx, noise } = setup();
  noise.apply(enabled, "#204080", 0, 0, 1);
  noise.apply({ ...enabled, showNoiseTexture: false }, "#204080", 0, 0, 1);
  noise.apply(enabled, "#204080", 0, 0, 1);
  expect(ctx.createPattern).toHaveBeenCalledTimes(4);
});

test("textures only the note shape by compositing on top of it", () => {
  const { ctx, noise } = setup();
  const operations: string[] = [];
  Object.defineProperty(ctx, "globalCompositeOperation", {
    configurable: true,
    get: () => operations.at(-1) ?? "source-over",
    set: (value: string) => {
      operations.push(value);
    },
  });
  noise.apply(enabled, "#204080", 0, 0, 1);
  expect(operations).toContain("source-atop");
  expect(ctx.save).toHaveBeenCalledOnce();
  expect(ctx.restore).toHaveBeenCalledOnce();
  expect(vi.mocked(ctx.fill)).toHaveBeenCalledOnce();
});
