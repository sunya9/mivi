interface ViewRange {
  viewRangeTop: number;
  viewRangeBottom: number;
}

export function isMidiInViewRange(midi: number, range: ViewRange): boolean {
  return midi <= range.viewRangeTop && midi >= range.viewRangeBottom;
}
