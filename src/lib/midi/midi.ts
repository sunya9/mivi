import { NoteJSON } from "@tonejs/midi/dist/Note";

export interface TrackConfig {
  visible: boolean;
  color: string;
  opacity: number;
  name: string;
  scale: number;
  staccato: boolean;
}

export interface MidiTrack {
  id: string;
  notes: NoteJSON[];
  config: TrackConfig;
}

export interface MidiTracks {
  hash: string;
  /** Random key generated on each load, used for React key prop to trigger remount */
  instanceKey: string;
  name: string;
  tracks: MidiTrack[];
  duration: number;
  minNote: number;
  maxNote: number;
  midiOffset: number;
}

export const getDefaultTrackConfig = (
  name: string,
  color: string = "#ffffff",
): TrackConfig => ({
  visible: true,
  color,
  opacity: 1,
  name,
  scale: 1,
  staccato: false,
});
