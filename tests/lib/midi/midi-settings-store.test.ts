import { testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import type { MidiTracks } from "@/lib/midi/midi";
import {
  applyMidiSettings,
  createMidiSettingsStore,
  extractMidiSettings,
  type MidiSettings,
} from "@/lib/midi/midi-settings-store";

const parsed: MidiTracks = {
  ...testMidiTracks,
  tracks: [
    { ...testMidiTracks.tracks[0], id: "a", sourceIndex: 0 },
    { ...testMidiTracks.tracks[0], id: "b", sourceIndex: 1 },
  ],
};

const edited: MidiTracks = {
  ...parsed,
  midiOffset: 1.5,
  tracks: [
    { ...parsed.tracks[1], config: { ...parsed.tracks[1].config, color: "#ff0000" } },
    { ...parsed.tracks[0], config: { ...parsed.tracks[0].config, visible: false } },
  ],
};

test("extractMidiSettings keeps only the edits keyed by source index", () => {
  expect(extractMidiSettings(edited)).toEqual({
    hash: parsed.hash,
    midiOffset: 1.5,
    tracks: [
      { sourceIndex: 1, config: edited.tracks[0].config },
      { sourceIndex: 0, config: edited.tracks[1].config },
    ],
  });
});

test("applyMidiSettings restores order, configs and offset for the same file", () => {
  const settings = extractMidiSettings(edited);

  const applied = applyMidiSettings(parsed, settings);

  expect(applied.midiOffset).toBe(1.5);
  expect(applied.tracks.map((track) => track.id)).toEqual(["b", "a"]);
  expect(applied.tracks[0].config.color).toBe("#ff0000");
  expect(applied.tracks[1].config.visible).toBe(false);
  expect(applied.tracks[0].notes).toBe(parsed.tracks[1].notes);
  expect(applied.instanceKey).toBe(parsed.instanceKey);
});

test("applyMidiSettings ignores settings from another file or without settings", () => {
  const settings = { ...extractMidiSettings(edited), hash: "other" };
  expect(applyMidiSettings(parsed, settings)).toBe(parsed);
  expect(applyMidiSettings(parsed, undefined)).toBe(parsed);
});

test("applyMidiSettings ignores settings whose tracks do not match the file", () => {
  const missing: MidiSettings = {
    ...extractMidiSettings(edited),
    tracks: [{ sourceIndex: 0, config: parsed.tracks[0].config }],
  };
  const unknown: MidiSettings = {
    ...extractMidiSettings(edited),
    tracks: [
      { sourceIndex: 0, config: parsed.tracks[0].config },
      { sourceIndex: 5, config: parsed.tracks[0].config },
    ],
  };
  expect(applyMidiSettings(parsed, missing)).toBe(parsed);
  expect(applyMidiSettings(parsed, unknown)).toBe(parsed);
});

test("createMidiSettingsStore persists to localStorage", () => {
  const settings = extractMidiSettings(edited);
  createMidiSettingsStore().set(settings);

  expect(createMidiSettingsStore().getSnapshot()).toEqual(settings);
});
