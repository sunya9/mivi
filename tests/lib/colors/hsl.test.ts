import { expect, test, vi } from "vitest";
import {
  hslToHex,
  randomHue,
  HSL_PRESETS,
  generateGoldenAngleHues,
} from "@/lib/colors/hsl";

// hslToHex tests

test("hslToHex converts pure red (h=0, s=100, l=50) to #ff0000", () => {
  expect(hslToHex(0, 100, 50)).toBe("#ff0000");
});

test("hslToHex converts pure green (h=120, s=100, l=50) to #00ff00", () => {
  expect(hslToHex(120, 100, 50)).toBe("#00ff00");
});

test("hslToHex converts pure blue (h=240, s=100, l=50) to #0000ff", () => {
  expect(hslToHex(240, 100, 50)).toBe("#0000ff");
});

test("hslToHex converts white (h=0, s=0, l=100) to #ffffff", () => {
  expect(hslToHex(0, 0, 100)).toBe("#ffffff");
});

test("hslToHex converts black (h=0, s=0, l=0) to #000000", () => {
  expect(hslToHex(0, 0, 0)).toBe("#000000");
});

test("hslToHex converts gray (h=0, s=0, l=50) to #808080", () => {
  expect(hslToHex(0, 0, 50)).toBe("#808080");
});

test("hslToHex handles pastel colors correctly", () => {
  const hex = hslToHex(0, 70, 80);
  expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  expect(r).toBeGreaterThan(200);
  expect(g).toBeGreaterThan(150);
});

test("hslToHex handles dark colors correctly", () => {
  const hex = hslToHex(0, 80, 30);
  expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  expect(r).toBeGreaterThan(50);
  expect(r).toBeLessThan(150);
  expect(g).toBeLessThan(50);
});

// randomHue tests

test("randomHue returns a value between 0 and 360", () => {
  for (let i = 0; i < 100; i++) {
    const hue = randomHue();
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  }
});

test("randomHue returns different values on subsequent calls", () => {
  const values = new Set<number>();
  for (let i = 0; i < 10; i++) {
    values.add(randomHue());
  }
  expect(values.size).toBeGreaterThan(1);
});

test("randomHue uses Math.random internally", () => {
  const mockRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);
  expect(randomHue()).toBe(180);
  mockRandom.mockRestore();
});

test("HSL_PRESETS produce valid hex colors for all presets and hues", () => {
  for (const preset of HSL_PRESETS) {
    for (const h of [0, 60, 120, 180, 240, 300]) {
      const hex = hslToHex(h, preset.s, preset.l);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  }
});

// generateGoldenAngleHues tests

test("generateGoldenAngleHues returns array of specified length", () => {
  expect(generateGoldenAngleHues(0)).toHaveLength(0);
  expect(generateGoldenAngleHues(1)).toHaveLength(1);
  expect(generateGoldenAngleHues(5)).toHaveLength(5);
  expect(generateGoldenAngleHues(10)).toHaveLength(10);
});

test("generateGoldenAngleHues returns values between 0 and 360", () => {
  const hues = generateGoldenAngleHues(100);
  for (const hue of hues) {
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  }
});

test("generateGoldenAngleHues distributes hues using golden angle (~137.5°)", () => {
  const mockRandom = vi.spyOn(Math, "random").mockReturnValue(0);
  const hues = generateGoldenAngleHues(3);
  // With startHue = 0, hues should be approximately 0, 137.5, 275
  expect(hues[0]).toBeCloseTo(0, 1);
  expect(hues[1]).toBeCloseTo(137.5, 0);
  expect(hues[2]).toBeCloseTo(275, 0);
  mockRandom.mockRestore();
});

test("generateGoldenAngleHues produces well-distributed hues for many tracks", () => {
  const hues = generateGoldenAngleHues(10);
  // Check that no two adjacent hues in the generated array are too close
  // Golden angle ensures minimum separation of ~137.5° between consecutive values
  for (let i = 1; i < hues.length; i++) {
    const diff = Math.abs(hues[i] - hues[i - 1]);
    const wrappedDiff = Math.min(diff, 360 - diff);
    expect(wrappedDiff).toBeGreaterThan(100); // Should be ~137.5°
  }
});
