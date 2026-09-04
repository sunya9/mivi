import { expect, test } from "vitest";

import {
  srgbToHex,
  hexToRgb,
  brightenHexColor,
  darkenHexColor,
  hexLuminance,
} from "@/lib/colors/hex";

// srgbToHex tests

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

// hexToRgb tests

test("hexToRgb parses #ff8000 to [255, 128, 0]", () => {
  expect(hexToRgb("#ff8000")).toEqual([255, 128, 0]);
});

test("hexToRgb parses black and white", () => {
  expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
});

// brightenHexColor tests

test("brightenHexColor with intensity 0 keeps the original channels", () => {
  expect(brightenHexColor("#ff0000", 0)).toBe("rgb(255, 0, 0)");
});

test("brightenHexColor with intensity 1 saturates to white", () => {
  expect(brightenHexColor("#000000", 1)).toBe("rgb(255, 255, 255)");
});

test("brightenHexColor adds intensity * 255 to each channel and clamps at 255", () => {
  expect(brightenHexColor("#ff0000", 0.5)).toBe("rgb(255, 127.5, 127.5)");
});

// hexLuminance tests

test("hexLuminance returns 1 for white and 0 for black", () => {
  expect(hexLuminance("#ffffff")).toBeCloseTo(1);
  expect(hexLuminance("#000000")).toBeCloseTo(0);
});

test("hexLuminance weights red at 0.299", () => {
  expect(hexLuminance("#ff0000")).toBeCloseTo(0.299);
});

// darkenHexColor tests

test("darkenHexColor with amount 0 keeps the color", () => {
  expect(darkenHexColor("#3b82f6", 0)).toBe("#3b82f6");
});

test("darkenHexColor scales each channel towards black", () => {
  expect(darkenHexColor("#ffffff", 0.5)).toBe("#808080");
  expect(darkenHexColor("#ff0000", 0.25)).toBe("#bf0000");
});

test("darkenHexColor with amount 1 is black", () => {
  expect(darkenHexColor("#3b82f6", 1)).toBe("#000000");
});
