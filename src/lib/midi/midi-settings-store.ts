import type { MidiTracks, TrackConfig } from "@/lib/midi/midi";
import { PersistedStore } from "@/lib/store/persisted-store";

export interface MidiSettings {
  hash: string;
  midiOffset: number;
  tracks: { sourceIndex: number; config: TrackConfig }[];
}

export type MidiSettingsStore = PersistedStore<MidiSettings | undefined>;

export function createMidiSettingsStore(): MidiSettingsStore {
  return new PersistedStore("mivi:midi-settings", (persisted) => persisted);
}

export function extractMidiSettings(midiTracks: MidiTracks): MidiSettings {
  return {
    hash: midiTracks.hash,
    midiOffset: midiTracks.midiOffset,
    tracks: midiTracks.tracks.map(({ sourceIndex, config }) => ({ sourceIndex, config })),
  };
}

export function applyMidiSettings(
  midiTracks: MidiTracks,
  settings: MidiSettings | undefined,
): MidiTracks {
  if (!settings || settings.hash !== midiTracks.hash) return midiTracks;
  const bySourceIndex = new Map(midiTracks.tracks.map((track) => [track.sourceIndex, track]));
  const indices = settings.tracks.map((track) => track.sourceIndex);
  const covered =
    indices.length === midiTracks.tracks.length &&
    new Set(indices).size === indices.length &&
    indices.every((index) => bySourceIndex.has(index));
  if (!covered) return midiTracks;
  return {
    ...midiTracks,
    midiOffset: settings.midiOffset,
    tracks: settings.tracks.map(({ sourceIndex, config }) => ({
      ...bySourceIndex.get(sourceIndex)!,
      config,
    })),
  };
}
