import { MidiNote } from "@/lib/midi/midi";

/**
 * Binary search to find the index of the first note whose end time (time + duration)
 * is >= the given threshold. Notes must be sorted by time in ascending order.
 */
export function findFirstVisibleNoteIndex(
  notes: MidiNote[],
  thresholdTime: number,
): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const noteEnd = notes[mid].time + notes[mid].duration;
    if (noteEnd < thresholdTime) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
