import { midiTracksAtom } from "@/atoms/midiTracksAtom";
import { fileDb, fileKeys } from "@/atoms/minidb";
import { getRandomTailwindColor } from "@/lib/tailwindColors";
import { MidiTracks } from "@/types/midi";
import { Midi } from "@tonejs/midi";
import { atom } from "jotai";

export const midiFileAtom = fileDb.item(fileKeys.midi);

const midiBaseAtom = atom<Midi>();
export const midiDurationAtom = atom(async (get) => {
  const midi = await get(midiAtom);
  return midi?.duration || 0;
});
export const midiAtom = atom(
  (get) => {
    const file = get(midiFileAtom);
    if (!file) return undefined;
    return file.arrayBuffer().then((arrayBuffer) => new Midi(arrayBuffer));
  },
  async (_, set, file: File | undefined) => {
    if (!file) {
      set(midiTracksAtom, undefined);
      set(midiBaseAtom, undefined);
      return set(midiFileAtom, undefined);
    }
    return set(midiFileAtom, file)
      .then(() => file.arrayBuffer())
      .then((arrayBuffer) => new Midi(arrayBuffer))
      .then((midi) => {
        const tracks = midi.tracks.map((track, index) => {
          const color = getRandomTailwindColor();
          return {
            id: crypto.randomUUID(),
            notes: track.notes.map((note) => note.toJSON()),
            config: {
              name: track.name || `Track ${index + 1}`,
              color,
              visible: true,
              opacity: 1,
            },
          };
        });
        const newMidiTracks: MidiTracks = {
          tracks,
          duration: midi.duration,
        };
        set(midiTracksAtom, newMidiTracks);
        set(midiBaseAtom, midi);
      });
  },
);
