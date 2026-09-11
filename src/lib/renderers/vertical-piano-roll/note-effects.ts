import { darkenHexColor } from "@/lib/colors/hex";

// At 30 fps a 10 ms note would never land inside a frame, so keys stay lit at least this long
export const MIN_PRESS_DURATION = 0.08;

export function isKeyPressed(noteTime: number, noteEnd: number, currentTime: number): boolean {
  const pressedUntil = noteTime + Math.max(noteEnd - noteTime, MIN_PRESS_DURATION);
  return currentTime >= noteTime && currentTime < pressedUntil;
}

interface BlackKeyNoteConfig {
  darkenBlackKeyNotes: boolean;
  blackKeyNoteDarkness: number;
}

export function resolveNoteBaseColor(
  trackColor: string,
  isBlackKey: boolean,
  config: BlackKeyNoteConfig,
): string {
  if (!isBlackKey || !config.darkenBlackKeyNotes) return trackColor;
  return darkenHexColor(trackColor, config.blackKeyNoteDarkness);
}
