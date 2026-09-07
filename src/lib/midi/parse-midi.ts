import { Midi } from "@tonejs/midi";

import { hashArrayBuffer } from "@/lib/hash";
import { getDefaultTrackConfig, type MidiTrack, type MidiTracks } from "@/lib/midi/midi";

export async function parseMidi(file: File): Promise<MidiTracks> {
  const arrayBuffer = await file.arrayBuffer();
  const [hash, midi] = await Promise.all([
    hashArrayBuffer(arrayBuffer),
    Promise.resolve(new Midi(arrayBuffer)),
  ]);
  let noteId = 0;
  const tracks = midi.tracks.map((track, index): MidiTrack => {
    const config = getDefaultTrackConfig(track.name || `Track ${index + 1}`);
    return {
      id: crypto.randomUUID(),
      sourceIndex: index,
      notes: track.notes.map((note) => ({ ...note.toJSON(), id: noteId++ })),
      config,
    };
  });
  const notes = tracks.flatMap((track) => track.notes);
  return {
    hash,
    instanceKey: crypto.randomUUID(),
    name: file.name,
    tracks,
    duration: midi.duration,
    minNote: notes.reduce((a, b) => Math.min(a, b.midi), Infinity),
    maxNote: notes.reduce((a, b) => Math.max(a, b.midi), -Infinity),
    midiOffset: 0,
  };
}
