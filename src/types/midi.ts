import { NoteJSON } from "@tonejs/midi/dist/Note";

export interface TrackConfig {
  visible: boolean;
  color: string;
  opacity: number;
  name: string;
}

export interface MidiTrack {
  id: string;
  notes: NoteJSON[];
  config: TrackConfig;
}

export interface MidiTracks {
  tracks: MidiTrack[];
  duration: number;
}

export const getDefaultTrackConfig = (name: string): TrackConfig => ({
  visible: true,
  color: "#4a9eff",
  opacity: 1,
  name,
});
