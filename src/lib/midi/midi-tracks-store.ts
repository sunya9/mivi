import type { MidiTracks } from "@/lib/midi/midi";
import { ValueStore } from "@/lib/store/value-store";

export type MidiTracksStore = ValueStore<MidiTracks | undefined>;

export function createMidiTracksStore(): MidiTracksStore {
  return new ValueStore<MidiTracks | undefined>(undefined);
}
