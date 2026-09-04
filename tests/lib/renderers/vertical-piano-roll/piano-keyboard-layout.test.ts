import { expect, test } from "vitest";

import {
  createKeyboardLayout,
  isBlackKey,
  snapRangeToWhiteKeys,
} from "@/lib/renderers/vertical-piano-roll/piano-keyboard-layout";

test("isBlackKey identifies the five black keys in every octave", () => {
  const blackInOctave = new Set([1, 3, 6, 8, 10]);
  for (let midi = 0; midi < 128; midi++) {
    expect(isBlackKey(midi)).toBe(blackInOctave.has(midi % 12));
  }
});

test("snapRangeToWhiteKeys keeps white ends unchanged", () => {
  expect(snapRangeToWhiteKeys(21, 108)).toEqual([21, 108]);
});

test("snapRangeToWhiteKeys floors bottom and ceils top to white keys", () => {
  expect(snapRangeToWhiteKeys(22, 106)).toEqual([21, 107]);
});

test("snapRangeToWhiteKeys swaps reversed ranges", () => {
  expect(snapRangeToWhiteKeys(108, 21)).toEqual([21, 108]);
});

test("snapRangeToWhiteKeys clamps to the MIDI range", () => {
  expect(snapRangeToWhiteKeys(-5, 200)).toEqual([0, 127]);
});

test("snapRangeToWhiteKeys expands a single black key to its white neighbours", () => {
  expect(snapRangeToWhiteKeys(61, 61)).toEqual([60, 62]);
});

test("createKeyboardLayout divides the width equally among white keys", () => {
  const layout = createKeyboardLayout(60, 72, 800);
  expect(layout.firstMidi).toBe(60);
  expect(layout.lastMidi).toBe(72);
  expect(layout.whiteKeyWidth).toBe(100);
  expect(layout.keys).toHaveLength(13);
  const whiteKeys = layout.keys.filter((k) => !k.isBlack);
  expect(whiteKeys).toHaveLength(8);
  expect(whiteKeys.reduce((sum, k) => sum + k.width, 0)).toBe(800);
  expect(layout.byMidi[60]).toMatchObject({ x: 0, width: 100, isBlack: false });
  expect(layout.byMidi[72]).toMatchObject({ x: 700, width: 100, isBlack: false });
});

test("createKeyboardLayout centers a narrower black key on the white key boundary", () => {
  const layout = createKeyboardLayout(60, 72, 800);
  expect(layout.blackKeyWidth).toBe(60);
  expect(layout.byMidi[61]).toMatchObject({ x: 70, width: 60, isBlack: true });
  expect(layout.byMidi[70]).toMatchObject({ x: 570, width: 60, isBlack: true });
});

test("createKeyboardLayout leaves out-of-range keys undefined", () => {
  const layout = createKeyboardLayout(60, 72, 800);
  expect(layout.byMidi).toHaveLength(128);
  expect(layout.byMidi[59]).toBeUndefined();
  expect(layout.byMidi[73]).toBeUndefined();
});

test("createKeyboardLayout lists keys in ascending midi order", () => {
  const layout = createKeyboardLayout(21, 108, 1280);
  const midis = layout.keys.map((k) => k.midi);
  expect(midis).toEqual([...midis].sort((a, b) => a - b));
  expect(midis[0]).toBe(21);
  expect(midis.at(-1)).toBe(108);
});

test("createKeyboardLayout snaps the requested range before laying out", () => {
  const layout = createKeyboardLayout(61, 61, 100);
  expect(layout.firstMidi).toBe(60);
  expect(layout.lastMidi).toBe(62);
  expect(layout.whiteKeyWidth).toBe(50);
});

test("createKeyboardLayout produces finite values for zero width", () => {
  const layout = createKeyboardLayout(60, 72, 0);
  for (const key of layout.keys) {
    expect(Number.isFinite(key.x)).toBe(true);
    expect(Number.isFinite(key.width)).toBe(true);
  }
});
