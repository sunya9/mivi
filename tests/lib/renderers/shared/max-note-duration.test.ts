import { expect, test } from "vitest";

import { MidiNote } from "@/lib/midi/midi";
import { maxNoteDuration } from "@/lib/renderers/shared/max-note-duration";

function makeNote(id: number, time: number, duration: number): MidiNote {
  return { id, time, duration, midi: 60, name: "C4", velocity: 1, ticks: 0, durationTicks: 0 };
}

test("returns 0 for an empty track", () => {
  expect(maxNoteDuration([])).toBe(0);
});

test("returns the longest duration in the track", () => {
  const notes = [makeNote(0, 0, 0.5), makeNote(1, 1, 3), makeNote(2, 2, 0.1)];
  expect(maxNoteDuration(notes)).toBe(3);
});

test("answers from the cache for the same array and recomputes for a new one", () => {
  const notes = [makeNote(0, 0, 0.5), makeNote(1, 1, 3)];
  expect(maxNoteDuration(notes)).toBe(3);
  notes.push(makeNote(2, 2, 10));
  expect(maxNoteDuration(notes)).toBe(3);
  expect(maxNoteDuration([...notes])).toBe(10);
});
