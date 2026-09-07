import { testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import { FileSlot } from "@/lib/file-store/file-slot";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { bindMidiTracks } from "@/lib/midi/bind-midi-tracks";
import type { MidiTracks } from "@/lib/midi/midi";
import { createMidiSettingsStore, extractMidiSettings } from "@/lib/midi/midi-settings-store";
import { createMidiTracksStore } from "@/lib/midi/midi-tracks-store";

const file = new File(["m"], "test.mid", { type: "audio/midi" });

function setup(parsed: MidiTracks = testMidiTracks) {
  const slot = new FileSlot<MidiTracks>({
    key: "midi",
    label: "MIDI file",
    storage: new MemoryFileStorage(),
    decode: async () => parsed,
  });
  const midiTracksStore = createMidiTracksStore();
  const midiSettingsStore = createMidiSettingsStore();
  bindMidiTracks(slot, midiTracksStore, midiSettingsStore);
  return { slot, midiTracksStore, midiSettingsStore };
}

test("publishes the parsed file as editable tracks and persists their settings", async () => {
  const { slot, midiTracksStore, midiSettingsStore } = setup();

  await slot.setFile(file);

  expect(midiTracksStore.getSnapshot()).toBe(testMidiTracks);
  expect(midiSettingsStore.getSnapshot()).toEqual(extractMidiSettings(testMidiTracks));
});

test("layers persisted settings over a parsed file with the same hash", async () => {
  localStorage.setItem(
    "mivi:midi-settings",
    JSON.stringify({ ...extractMidiSettings(testMidiTracks), midiOffset: 2 }),
  );
  const { slot, midiTracksStore } = setup();

  await slot.setFile(file);

  expect(midiTracksStore.getSnapshot()?.midiOffset).toBe(2);
});

test("applies a file that was already decoded before binding", () => {
  const slot = new FileSlot<MidiTracks>({
    key: "midi",
    label: "MIDI file",
    storage: new MemoryFileStorage(),
    decode: async () => testMidiTracks,
  });
  const midiTracksStore = createMidiTracksStore();
  return slot.setFile(file).then(() => {
    bindMidiTracks(slot, midiTracksStore, createMidiSettingsStore());
    expect(midiTracksStore.getSnapshot()).toBe(testMidiTracks);
  });
});

test("edits are written to the settings store", async () => {
  const { slot, midiTracksStore, midiSettingsStore } = setup();
  await slot.setFile(file);

  midiTracksStore.set((tracks) => tracks && { ...tracks, midiOffset: 0.5 });

  expect(midiSettingsStore.getSnapshot()?.midiOffset).toBe(0.5);
});

test("clearing the file clears the tracks and settings", async () => {
  const { slot, midiTracksStore, midiSettingsStore } = setup();
  await slot.setFile(file);

  await slot.setFile(undefined);

  expect(midiTracksStore.getSnapshot()).toBeUndefined();
  expect(midiSettingsStore.getSnapshot()).toBeUndefined();
});

test("a decode in progress leaves the current tracks untouched", async () => {
  const { slot, midiTracksStore } = setup();
  await slot.setFile(file);
  const before = midiTracksStore.getSnapshot();

  const pending = slot.setFile(new File(["n"], "next.mid"));
  expect(midiTracksStore.getSnapshot()).toBe(before);
  await pending;
});
