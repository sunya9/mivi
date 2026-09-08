import { expect, test } from "vitest";

import { computePressOffset } from "@/lib/renderers/shared/note-press";

const depth = 4;
const duration = 0.1;

test("returns 0 before the press starts", () => {
  expect(computePressOffset(2, 2.5, duration, depth, 1.9)).toBe(0);
});

test("ramps down to the full depth while pressed", () => {
  expect(computePressOffset(2, 2.5, duration, depth, 2)).toBe(0);
  expect(computePressOffset(2, 2.5, duration, depth, 2.05)).toBeCloseTo(depth / 2);
  expect(computePressOffset(2, 2.5, duration, depth, 2.1)).toBeCloseTo(depth);
  expect(computePressOffset(2, 2.5, duration, depth, 2.3)).toBeCloseTo(depth);
});

test("ramps back to rest after the press ends", () => {
  expect(computePressOffset(2, 2.5, duration, depth, 2.55)).toBeCloseTo(depth / 2);
  expect(computePressOffset(2, 2.5, duration, depth, 2.6)).toBe(0);
  expect(computePressOffset(2, 2.5, duration, depth, 5)).toBe(0);
});

test("releases from the depth actually reached by a short press", () => {
  expect(computePressOffset(2, 2.05, duration, depth, 2.05)).toBeCloseTo(depth / 2);
  expect(computePressOffset(2, 2.05, duration, depth, 2.1)).toBeCloseTo(depth / 4);
  expect(computePressOffset(2, 2.05, duration, depth, 2.15)).toBe(0);
});

test("snaps without a ramp when the animation duration is 0", () => {
  expect(computePressOffset(2, 2.5, 0, depth, 2)).toBe(depth);
  expect(computePressOffset(2, 2.5, 0, depth, 2.5)).toBe(0);
});
