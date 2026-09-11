import { expect, test } from "vitest";

import {
  MIN_PRESS_DURATION,
  isKeyPressed,
  resolveNoteBaseColor,
} from "@/lib/renderers/vertical-piano-roll/note-effects";

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
