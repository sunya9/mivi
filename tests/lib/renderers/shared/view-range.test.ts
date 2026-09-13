import { expect, test } from "vitest";

import { isMidiInViewRange } from "@/lib/renderers/shared/view-range";

const range = { viewRangeTop: 72, viewRangeBottom: 60 };

test("includes both ends of the range", () => {
  expect(isMidiInViewRange(60, range)).toBe(true);
  expect(isMidiInViewRange(72, range)).toBe(true);
  expect(isMidiInViewRange(66, range)).toBe(true);
});

test("excludes notes outside the range", () => {
  expect(isMidiInViewRange(59, range)).toBe(false);
  expect(isMidiInViewRange(73, range)).toBe(false);
});
