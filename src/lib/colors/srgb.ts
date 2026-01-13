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
