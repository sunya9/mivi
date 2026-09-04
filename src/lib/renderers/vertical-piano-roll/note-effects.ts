import { darkenHexColor } from "@/lib/colors/color";

// At 30 fps a 10 ms note would never land inside a frame, so keys stay lit at least this long
export const MIN_PRESS_DURATION = 0.08;

interface FlashConfig {
  noteFlashMode: "on" | "duration";
  noteFlashDuration: number;
  noteFlashIntensity: number;
  noteFlashFadeOutDuration: number;
}

export function computeFlashIntensity(
  config: FlashConfig,
  noteTime: number,
  noteEnd: number,
  currentTime: number,
): number {
  const elapsed = currentTime - noteTime;
  if (elapsed < 0) return 0;

  if (config.noteFlashMode === "duration") {
    const progress = elapsed / config.noteFlashDuration;
    return progress >= 1 ? 0 : config.noteFlashIntensity * (1 - progress);
  }

  if (currentTime < noteEnd) return config.noteFlashIntensity;
  const fadeProgress = (currentTime - noteEnd) / config.noteFlashFadeOutDuration;
  return fadeProgress >= 1 ? 0 : config.noteFlashIntensity * (1 - fadeProgress);
}

export function computeRippleProgress(
  rippleDuration: number,
  noteTime: number,
  currentTime: number,
): number | null {
  const elapsed = currentTime - noteTime;
  if (elapsed < 0) return null;
  const progress = elapsed / rippleDuration;
  return progress >= 1 ? null : progress;
}

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
