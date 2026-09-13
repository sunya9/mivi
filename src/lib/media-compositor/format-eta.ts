export function formatEta(seconds: number | undefined): string {
  if (seconds === undefined) return "--";
  const totalSec = Math.ceil(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m${sec.toString().padStart(2, "0")}s`;
}
