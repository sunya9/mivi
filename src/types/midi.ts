import { NoteJSON } from "@tonejs/midi/dist/Note";

export interface TrackSettings {
  name: string;
  color: string;
  visible: boolean;
}

export interface MidiTrack {
  id: string;
  notes: NoteJSON[];
  settings: TrackSettings;
}

export interface MidiState {
  name: string;
  tracks: MidiTrack[];
}
