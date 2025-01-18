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
  tracks: MidiTrack[];
  duration: number;
  minNote: number;
  maxNote: number;
}

export const getDefaultTrackConfig = (
  name: string,
  color: string = "#4a9eff",
): TrackConfig => ({
  visible: true,
  color,
  opacity: 1,
  name,
  scale: 1,
  staccato: false,
});
