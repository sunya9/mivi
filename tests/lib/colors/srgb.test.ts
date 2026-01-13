import { expect, test } from "vitest";
import { srgbToHex } from "@/lib/colors/srgb";

test("srgbToHex converts black (0, 0, 0) to #000000", () => {
  expect(srgbToHex(0, 0, 0)).toBe("#000000");
});

test("srgbToHex converts white (1, 1, 1) to #ffffff", () => {
  expect(srgbToHex(1, 1, 1)).toBe("#ffffff");
});

test("srgbToHex converts pure red (1, 0, 0) to #ff0000", () => {
  expect(srgbToHex(1, 0, 0)).toBe("#ff0000");
});

test("srgbToHex converts pure green (0, 1, 0) to #00ff00", () => {
  expect(srgbToHex(0, 1, 0)).toBe("#00ff00");
});

test("srgbToHex converts pure blue (0, 0, 1) to #0000ff", () => {
  expect(srgbToHex(0, 0, 1)).toBe("#0000ff");
});

test("srgbToHex converts mid gray (0.5, 0.5, 0.5) to #808080", () => {
  expect(srgbToHex(0.5, 0.5, 0.5)).toBe("#808080");
});

test("srgbToHex clamps values above 1 to ff", () => {
  expect(srgbToHex(1.5, 2, 10)).toBe("#ffffff");
});

test("srgbToHex clamps negative values to 00", () => {
  expect(srgbToHex(-0.5, -1, -10)).toBe("#000000");
});

test("srgbToHex handles mixed clamping correctly", () => {
  expect(srgbToHex(-1, 0.5, 2)).toBe("#0080ff");
});

test("srgbToHex pads single digit hex values with zero", () => {
  // 1/255 ≈ 0.00392, rounds to 1 -> "01"
  expect(srgbToHex(1 / 255, 0, 0)).toBe("#010000");
});
