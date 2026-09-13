// Pure function of time so scrubbing or reverse playback lands on the same frame as forward playback.
// The release ramp is anchored to pressEnd so the note is back at rest the moment the playhead leaves it.
export function computePressOffset(
  pressStart: number,
  pressEnd: number,
  animationDuration: number,
  depth: number,
  currentTime: number,
): number {
  if (currentTime < pressStart || currentTime >= pressEnd) return 0;

  const ramp = (elapsed: number) =>
    animationDuration > 0 ? Math.min(1, elapsed / animationDuration) : 1;

  return depth * Math.min(ramp(currentTime - pressStart), ramp(pressEnd - currentTime));
}
