// Pure function of time so scrubbing or reverse playback lands on the same frame as forward playback
export function computePressOffset(
  pressStart: number,
  pressEnd: number,
  animationDuration: number,
  depth: number,
  currentTime: number,
): number {
  if (currentTime < pressStart) return 0;

  const ramp = (elapsed: number) =>
    animationDuration > 0 ? Math.min(1, elapsed / animationDuration) : 1;

  if (currentTime < pressEnd) return depth * ramp(currentTime - pressStart);

  const depthAtRelease = depth * ramp(pressEnd - pressStart);
  return depthAtRelease * (1 - ramp(currentTime - pressEnd));
}
