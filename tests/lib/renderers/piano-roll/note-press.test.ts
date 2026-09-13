import { expect, test } from "vitest";

import { computePressOffset } from "@/lib/renderers/piano-roll/note-press";

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

test("ramps back so that it reaches rest exactly when the press ends", () => {
  expect(computePressOffset(2, 2.5, duration, depth, 2.4)).toBeCloseTo(depth);
  expect(computePressOffset(2, 2.5, duration, depth, 2.45)).toBeCloseTo(depth / 2);
  expect(computePressOffset(2, 2.5, duration, depth, 2.5)).toBe(0);
  expect(computePressOffset(2, 2.5, duration, depth, 5)).toBe(0);
});

test("turns back halfway through a press shorter than the animation", () => {
  expect(computePressOffset(2, 2.05, duration, depth, 2.025)).toBeCloseTo(depth / 4);
  expect(computePressOffset(2, 2.05, duration, depth, 2.04)).toBeCloseTo(depth / 10);
  expect(computePressOffset(2, 2.05, duration, depth, 2.05)).toBe(0);
  expect(computePressOffset(2, 2.05, duration, depth, 2.1)).toBe(0);
});

test("snaps without a ramp when the animation duration is 0", () => {
  expect(computePressOffset(2, 2.5, 0, depth, 2)).toBe(depth);
  expect(computePressOffset(2, 2.5, 0, depth, 2.49)).toBe(depth);
  expect(computePressOffset(2, 2.5, 0, depth, 2.5)).toBe(0);
});
