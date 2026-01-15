import { ColorSpace, HSL, OKLCH, parse, sRGB, to } from "colorjs.io/fn";

ColorSpace.register(sRGB);
ColorSpace.register(HSL);
ColorSpace.register(OKLCH);

/**
 * Convert sRGB channel value (0-1) to hex string (00-ff)
 */
function channelToHex(value: number): string {
  const clamped = Math.min(Math.max(value, 0), 1);
  return Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
}

/**
 * Convert sRGB values (0-1 range) to hex color string
 */
export function srgbToHex(r: number, g: number, b: number): string {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

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
  const [r, g, b] = to({ space: "hsl", coords: [h, s, l] }, "srgb").coords;
  return srgbToHex(r ?? 0, g ?? 0, b ?? 0);
}

/**
 * Convert OKLCH color string to sRGB values (0-1 range)
 * @param oklchString OKLCH color string (e.g., "oklch(0.5 0.1 180)")
 * @returns Array of [r, g, b] values in 0-1 range
 */
export function oklchToSrgb(oklchString: string): [number, number, number] {
  const color = parse(oklchString);
  const [r, g, b] = to(color, "srgb").coords;
  return [r ?? 0, g ?? 0, b ?? 0];
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
