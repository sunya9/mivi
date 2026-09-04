import { expect, test } from "vitest";

import { MidiNote } from "@/lib/midi/midi";
import { findFirstNoteIndexFrom } from "@/lib/renderers/shared/find-first-note-from";

function makeNote(id: number, time: number): MidiNote {
  return {
    id,
    time,
    duration: 0.5,
    midi: 60,
    name: "C4",
    velocity: 1,
    ticks: 0,
    durationTicks: 0,
  };
}

test("returns 0 for empty array", () => {
  expect(findFirstNoteIndexFrom([], 0)).toBe(0);
});

test("returns 0 when all notes start at or after the time", () => {
  const notes = [makeNote(0, 1), makeNote(1, 2), makeNote(2, 3)];
  expect(findFirstNoteIndexFrom(notes, 1)).toBe(0);
});

test("skips notes that start before the time", () => {
  const notes = [makeNote(0, 0), makeNote(1, 0.5), makeNote(2, 1), makeNote(3, 1.5)];
  expect(findFirstNoteIndexFrom(notes, 0.7)).toBe(2);
});

test("includes a note starting exactly at the time", () => {
  const notes = [makeNote(0, 0), makeNote(1, 0.5), makeNote(2, 1)];
  expect(findFirstNoteIndexFrom(notes, 0.5)).toBe(1);
});

test("returns length when all notes start before the time", () => {
  const notes = [makeNote(0, 0), makeNote(1, 0.5)];
  expect(findFirstNoteIndexFrom(notes, 5)).toBe(2);
});

test("handles duplicate start times by returning the first one", () => {
  const notes = [makeNote(0, 0), makeNote(1, 1), makeNote(2, 1), makeNote(3, 1)];
  expect(findFirstNoteIndexFrom(notes, 1)).toBe(1);
});
