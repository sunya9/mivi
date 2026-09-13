import { MidiNote } from "@/lib/midi/midi";

const cache = new WeakMap<MidiNote[], number>();

// Notes are sorted by start time only, so culling by start must look back this far to be sound
export function maxNoteDuration(notes: MidiNote[]): number {
  let max = cache.get(notes);
  if (max === undefined) {
    max = 0;
    for (const note of notes) {
      if (note.duration > max) max = note.duration;
    }
    cache.set(notes, max);
  }
  return max;
}
