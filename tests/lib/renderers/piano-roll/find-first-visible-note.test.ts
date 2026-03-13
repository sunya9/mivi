import { expect, test } from "vitest";
import { findFirstVisibleNoteIndex } from "@/lib/renderers/piano-roll/find-first-visible-note";
import { MidiNote } from "@/lib/midi/midi";

function makeNote(id: number, time: number, duration: number): MidiNote {
  return {
    id,
    time,
    duration,
    midi: 60,
    name: "C4",
    velocity: 1,
    ticks: 0,
    durationTicks: 0,
  };
}

test("returns 0 for empty array", () => {
  expect(findFirstVisibleNoteIndex([], 0)).toBe(0);
});

test("returns 0 when all notes are visible", () => {
  const notes = [makeNote(0, 0, 1), makeNote(1, 1, 1), makeNote(2, 2, 1)];
  expect(findFirstVisibleNoteIndex(notes, 0)).toBe(0);
});

test("skips notes that end before threshold", () => {
  const notes = [
    makeNote(0, 0, 0.5),
    makeNote(1, 0.5, 0.5),
    makeNote(2, 1.0, 0.5),
    makeNote(3, 1.5, 0.5),
    makeNote(4, 2.0, 0.5),
  ];
  // threshold = 1.2 → note[0] ends at 0.5, note[1] ends at 1.0, note[2] ends at 1.5 >= 1.2
  expect(findFirstVisibleNoteIndex(notes, 1.2)).toBe(2);
});

test("returns length when all notes end before threshold", () => {
  const notes = [makeNote(0, 0, 0.5), makeNote(1, 0.5, 0.5)];
  expect(findFirstVisibleNoteIndex(notes, 5)).toBe(2);
});

test("includes note whose end time equals threshold exactly", () => {
  const notes = [makeNote(0, 0, 1), makeNote(1, 1, 1)];
  // threshold = 1.0 → note[0] ends at 1.0 >= 1.0
  expect(findFirstVisibleNoteIndex(notes, 1.0)).toBe(0);
});

test("handles single note visible", () => {
  const notes = [makeNote(0, 5, 1)];
  expect(findFirstVisibleNoteIndex(notes, 3)).toBe(0);
});

test("handles single note not visible", () => {
  const notes = [makeNote(0, 0, 1)];
  expect(findFirstVisibleNoteIndex(notes, 2)).toBe(1);
});
