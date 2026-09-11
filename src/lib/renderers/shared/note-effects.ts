interface FlashConfig {
  noteFlashMode: "on" | "duration";
  noteFlashDuration: number;
  noteFlashIntensity: number;
  noteFlashFadeOutDuration: number;
}

// Pure functions of time so scrubbing or reverse playback lands on the same frame as forward playback
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
