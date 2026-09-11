import { expect, test } from "vitest";

import {
  createSpectrumFillStyle,
  getGradientCoords,
  resolveBaseY,
} from "@/lib/renderers/audio-visualizer/gradient-utils";
import { GradientDirection, getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

const width = 100;
const height = 200;

test.each<{
  direction: GradientDirection;
  expected: [number, number, number, number];
}>([
  { direction: "to-right", expected: [0, 100, 100, 100] },
  { direction: "to-bottom-right", expected: [0, 0, 100, 200] },
  { direction: "to-bottom", expected: [50, 0, 50, 200] },
  { direction: "to-bottom-left", expected: [100, 0, 0, 200] },
  { direction: "to-left", expected: [100, 100, 0, 100] },
  { direction: "to-top-left", expected: [100, 200, 0, 0] },
  { direction: "to-top", expected: [50, 200, 50, 0] },
  { direction: "to-top-right", expected: [0, 200, 100, 0] },
])("getGradientCoords should return correct coords for $direction", ({ direction, expected }) => {
  const result = getGradientCoords(direction, width, height);
  expect(result).toEqual(expected);
});

test("getGradientCoords with square canvas", () => {
  const size = 100;
  expect(getGradientCoords("to-right", size, size)).toEqual([0, 50, 100, 50]);
  expect(getGradientCoords("to-bottom", size, size)).toEqual([50, 0, 50, 100]);
});

test.each([
  { position: "bottom" as const, expected: 200 },
  { position: "top" as const, expected: 0 },
  { position: "center" as const, expected: 100 },
])("resolveBaseY anchors the $position spectrum at $expected", ({ position, expected }) => {
  expect(resolveBaseY(position, height)).toBe(expected);
});

function setupCtx() {
  const canvas = document.createElement("canvas");
  return canvas.getContext("2d")!;
}

test("createSpectrumFillStyle returns the single color when gradients are off", () => {
  const ctx = setupCtx();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    useGradient: false,
    singleColor: "#123456",
  };
  expect(createSpectrumFillStyle(ctx, config, width, height)).toBe("#123456");
  expect(ctx.createLinearGradient).not.toHaveBeenCalled();
});

test("createSpectrumFillStyle builds a two-stop gradient along the configured direction", () => {
  const ctx = setupCtx();
  const config = {
    ...getDefaultRendererConfig().audioVisualizerConfig,
    useGradient: true,
    gradientDirection: "to-top" as const,
    gradientStartColor: "#000000",
    gradientEndColor: "#ffffff",
  };
  const gradient = createSpectrumFillStyle(ctx, config, width, height) as CanvasGradient;
  expect(ctx.createLinearGradient).toHaveBeenCalledExactlyOnceWith(50, 200, 50, 0);
  expect(gradient.addColorStop).toHaveBeenCalledWith(0, "#000000");
  expect(gradient.addColorStop).toHaveBeenCalledWith(1, "#ffffff");
});
