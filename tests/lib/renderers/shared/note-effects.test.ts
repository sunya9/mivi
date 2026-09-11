import { expect, test } from "vitest";

import { computeFlashIntensity, computeRippleProgress } from "@/lib/renderers/shared/note-effects";

const durationFlash = {
  noteFlashMode: "duration",
  noteFlashDuration: 1,
  noteFlashIntensity: 0.5,
  noteFlashFadeOutDuration: 0.2,
} as const;

const onFlash = { ...durationFlash, noteFlashMode: "on" } as const;

test("flash is off before the note starts", () => {
  expect(computeFlashIntensity(durationFlash, 1, 1.5, 0.9)).toBe(0);
  expect(computeFlashIntensity(onFlash, 1, 1.5, 0.9)).toBe(0);
});

test("duration mode starts at full intensity and decays linearly", () => {
  expect(computeFlashIntensity(durationFlash, 1, 1.5, 1)).toBeCloseTo(0.5);
  expect(computeFlashIntensity(durationFlash, 1, 1.5, 1.5)).toBeCloseTo(0.25);
  expect(computeFlashIntensity(durationFlash, 1, 1.5, 2)).toBe(0);
  expect(computeFlashIntensity(durationFlash, 1, 1.5, 3)).toBe(0);
});

test("on mode holds full intensity while the note sounds", () => {
  expect(computeFlashIntensity(onFlash, 1, 1.5, 1)).toBeCloseTo(0.5);
  expect(computeFlashIntensity(onFlash, 1, 1.5, 1.4)).toBeCloseTo(0.5);
});

test("on mode fades out after the note ends", () => {
  expect(computeFlashIntensity(onFlash, 1, 1.5, 1.6)).toBeCloseTo(0.25);
  expect(computeFlashIntensity(onFlash, 1, 1.5, 1.7)).toBeCloseTo(0);
  expect(computeFlashIntensity(onFlash, 1, 1.5, 5)).toBe(0);
});

test("ripple progress is null before the hit and after the ripple ends", () => {
  expect(computeRippleProgress(0.5, 1, 0.9)).toBeNull();
  expect(computeRippleProgress(0.5, 1, 1.5)).toBeNull();
});

test("ripple progress grows from 0 to 1 over the ripple duration", () => {
  expect(computeRippleProgress(0.5, 1, 1)).toBe(0);
  expect(computeRippleProgress(0.5, 1, 1.25)).toBeCloseTo(0.5);
});
