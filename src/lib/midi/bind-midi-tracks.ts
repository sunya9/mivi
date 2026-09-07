import type { FileSlot } from "@/lib/file-store/file-slot";
import type { MidiTracks } from "@/lib/midi/midi";
import {
  applyMidiSettings,
  extractMidiSettings,
  type MidiSettingsStore,
} from "@/lib/midi/midi-settings-store";
import type { MidiTracksStore } from "@/lib/midi/midi-tracks-store";

export function bindMidiTracks(
  midiSlot: FileSlot<MidiTracks>,
  midiTracksStore: MidiTracksStore,
  midiSettingsStore: MidiSettingsStore,
): void {
  let lastParsed: MidiTracks | undefined;
  const applyParsed = () => {
    const parsed = midiSlot.getSnapshot().decoded;
    if (parsed === lastParsed) return;
    lastParsed = parsed;
    midiTracksStore.set(parsed && applyMidiSettings(parsed, midiSettingsStore.getSnapshot()));
  };
  const persistEdits = () => {
    const midiTracks = midiTracksStore.getSnapshot();
    midiSettingsStore.set(midiTracks && extractMidiSettings(midiTracks));
  };

  applyParsed();
  midiSlot.subscribe(applyParsed);
  midiTracksStore.subscribe(persistEdits);
}
