import type { RendererContext } from "@/lib/renderers/renderer";
import type { AudioVisualizerConfig, GradientDirection } from "@/lib/renderers/renderer-config";

/**
 * Calculate gradient coordinates based on direction.
 * @returns [x0, y0, x1, y1] coordinates for createLinearGradient
 */
export function getGradientCoords(
  direction: GradientDirection,
  width: number,
  height: number,
): [number, number, number, number] {
  switch (direction) {
    case "to-right":
      return [0, height / 2, width, height / 2];
    case "to-bottom-right":
      return [0, 0, width, height];
    case "to-bottom":
      return [width / 2, 0, width / 2, height];
    case "to-bottom-left":
      return [width, 0, 0, height];
    case "to-left":
      return [width, height / 2, 0, height / 2];
    case "to-top-left":
      return [width, height, 0, 0];
    case "to-top":
      return [width / 2, height, width / 2, 0];
    case "to-top-right":
      return [0, height, width, 0];
  }
}

export function resolveBaseY(position: AudioVisualizerConfig["position"], height: number): number {
  switch (position) {
    case "bottom":
      return height;
    case "top":
      return 0;
    case "center":
      return height / 2;
  }
}

export function createSpectrumFillStyle(
  ctx: RendererContext,
  config: AudioVisualizerConfig,
  width: number,
  height: number,
): string | CanvasGradient {
  if (!config.useGradient) return config.singleColor;
  const [x0, y0, x1, y1] = getGradientCoords(config.gradientDirection, width, height);
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, config.gradientStartColor);
  gradient.addColorStop(1, config.gradientEndColor);
  return gradient;
}
