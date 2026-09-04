import { expect, test } from "vitest";

import {
  MIN_PRESS_DURATION,
  computeFlashIntensity,
  computeRippleProgress,
  isKeyPressed,
  resolveNoteBaseColor,
} from "@/lib/renderers/vertical-piano-roll/note-effects";

const durationFlash = {
  noteFlashMode: "duration",
  noteFlashDuration: 1,
  noteFlashIntensity: 0.5,
  noteFlashFadeOutDuration: 0.2,
} as const;

const onFlash = { ...durationFlash, noteFlashMode: "on" } as const;

test("flash is off before the note reaches the keyboard", () => {
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

test("key is pressed while the note sounds", () => {
  expect(isKeyPressed(1, 1.5, 1.2)).toBe(true);
  expect(isKeyPressed(1, 1.5, 1)).toBe(true);
});

test("key is released before the note starts and once it ends", () => {
  expect(isKeyPressed(1, 1.5, 0.9)).toBe(false);
  expect(isKeyPressed(1, 1.5, 1.5)).toBe(false);
});

test("very short notes stay pressed for the minimum press duration", () => {
  expect(isKeyPressed(1, 1.01, 1 + MIN_PRESS_DURATION / 2)).toBe(true);
  expect(isKeyPressed(1, 1.01, 1 + MIN_PRESS_DURATION)).toBe(false);
});

test("black key notes are darkened by the configured amount when enabled", () => {
  const config = { darkenBlackKeyNotes: true, blackKeyNoteDarkness: 0.5 };
  expect(resolveNoteBaseColor("#ffffff", true, config)).toBe("#808080");
  expect(resolveNoteBaseColor("#ffffff", false, config)).toBe("#ffffff");
});

test("black key notes keep the track color when darkening is disabled", () => {
  const config = { darkenBlackKeyNotes: false, blackKeyNoteDarkness: 0.5 };
  expect(resolveNoteBaseColor("#ffffff", true, config)).toBe("#ffffff");
});
