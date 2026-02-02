import type { GradientDirection } from "@/lib/renderers/renderer";

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
