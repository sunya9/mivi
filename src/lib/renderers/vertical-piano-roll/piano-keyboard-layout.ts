interface KeyGeometry {
  midi: number;
  x: number;
  width: number;
  isBlack: boolean;
}

export interface KeyboardLayout {
  keys: KeyGeometry[];
  byMidi: (KeyGeometry | undefined)[];
  firstMidi: number;
  lastMidi: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;
}

const BLACK_KEY_WIDTH_RATIO = 0.6;
const BLACK_KEYS_IN_OCTAVE = new Set([1, 3, 6, 8, 10]);

export function isBlackKey(midi: number): boolean {
  return BLACK_KEYS_IN_OCTAVE.has(midi % 12);
}

function clampMidi(midi: number): number {
  return Math.min(127, Math.max(0, Math.round(midi)));
}

export function snapRangeToWhiteKeys(bottom: number, top: number): [number, number] {
  let lo = clampMidi(Math.min(bottom, top));
  let hi = clampMidi(Math.max(bottom, top));
  // Black keys never sit at 0 or 127, so snapping outward stays within the MIDI range
  if (isBlackKey(lo)) lo -= 1;
  if (isBlackKey(hi)) hi += 1;
  return [lo, hi];
}

export function createKeyboardLayout(bottom: number, top: number, width: number): KeyboardLayout {
  const [firstMidi, lastMidi] = snapRangeToWhiteKeys(bottom, top);

  let whiteCount = 0;
  for (let midi = firstMidi; midi <= lastMidi; midi++) {
    if (!isBlackKey(midi)) whiteCount++;
  }

  const whiteKeyWidth = width / whiteCount;
  const blackKeyWidth = whiteKeyWidth * BLACK_KEY_WIDTH_RATIO;
  const keys: KeyGeometry[] = [];
  const byMidi: (KeyGeometry | undefined)[] = Array.from({ length: 128 });

  let whiteIndex = 0;
  for (let midi = firstMidi; midi <= lastMidi; midi++) {
    let key: KeyGeometry;
    if (isBlackKey(midi)) {
      key = {
        midi,
        x: whiteIndex * whiteKeyWidth - blackKeyWidth / 2,
        width: blackKeyWidth,
        isBlack: true,
      };
    } else {
      key = { midi, x: whiteIndex * whiteKeyWidth, width: whiteKeyWidth, isBlack: false };
      whiteIndex++;
    }
    keys.push(key);
    byMidi[midi] = key;
  }

  return { keys, byMidi, firstMidi, lastMidi, whiteKeyWidth, blackKeyWidth };
}
