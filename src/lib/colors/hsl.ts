import Color from "colorjs.io";
import { srgbToHex } from "./srgb";

export interface HSLPresetBase {
  name: string;
  s: number;
  l: number;
}

/**
 * Preset SL combinations for quick selection
 */
export const HSL_PRESETS = [
  { name: "vivid", s: 100, l: 60 },
  { name: "pastel", s: 80, l: 80 },
  { name: "dark", s: 80, l: 30 },
  { name: "muted", s: 40, l: 60 },
] as const satisfies readonly HSLPresetBase[];

/**
 * Convert HSL values to hex color string
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 */
export function hslToHex(h: number, s: number, l: number): string {
  const color = new Color("hsl", [h, s, l]);
  const [r, g, b] = color.srgb;
  return srgbToHex(r ?? 0, g ?? 0, b ?? 0);
}

/**
 * Generate a random hue value (0-360)
 */
export function randomHue(): number {
  return Math.random() * 360;
}

/**
 * Golden angle in degrees (360° / φ² where φ is the golden ratio)
 * This angle creates optimal distribution patterns found in nature (e.g., sunflower seeds)
 */
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 360 / (PHI * PHI); // ≈ 137.5°

/**
 * Generate an array of well-distributed hue values using the golden angle
 * @param count Number of hue values to generate
 * @returns Array of hue values (0-360) with optimal distribution
 */
export function generateGoldenAngleHues(count: number): number[] {
  const startHue = Math.random() * 360;
  return Array.from(
    { length: count },
    (_, i) => (startHue + i * GOLDEN_ANGLE) % 360,
  );
}
