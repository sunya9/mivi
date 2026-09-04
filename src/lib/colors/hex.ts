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

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function brightenHexColor(hex: string, intensity: number): string {
  const [r, g, b] = hexToRgb(hex);
  const brightenValue = intensity * 255;
  return `rgb(${Math.min(255, r + brightenValue)}, ${Math.min(255, g + brightenValue)}, ${Math.min(255, b + brightenValue)})`;
}

export function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function darkenHexColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 - amount;
  return srgbToHex((r * factor) / 255, (g * factor) / 255, (b * factor) / 255);
}
