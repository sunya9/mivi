import { NoteJSON } from "@tonejs/midi/dist/Note";

export interface TrackConfig {
  name: string;
  color: string;
  visible: boolean;
}

export interface MidiTrack {
  id: string;
  notes: NoteJSON[];
  config: TrackConfig;
}

export interface MidiState {
  name: string;
  duration: number;
  tracks: MidiTrack[];
}
