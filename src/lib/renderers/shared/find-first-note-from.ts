import { MidiNote } from "@/lib/midi/midi";

/**
 * Binary search for the first note whose start time is >= the given time.
 * Unlike end-time based search this is sound for any duration mix because
 * start times are the sort key.
 */
export function findFirstNoteIndexFrom(notes: MidiNote[], time: number): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (notes[mid].time < time) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
