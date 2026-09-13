import { test, expect } from "vitest";

import { formatEta } from "@/lib/media-compositor/format-eta";

test("unknown eta renders as a placeholder", () => {
  expect(formatEta(undefined)).toBe("--");
});

test("a minute or more is NmSSs with zero-padded seconds", () => {
  expect(formatEta(490)).toBe("8m10s");
});

test("under a minute drops the minutes part", () => {
  expect(formatEta(40)).toBe("40s");
});

test("standalone seconds are not zero-padded", () => {
  expect(formatEta(1.3)).toBe("2s");
});

test("never shows 0s while work remains", () => {
  expect(formatEta(0.11)).toBe("1s");
});

test("rounding up to a full minute carries into minutes", () => {
  expect(formatEta(59.5)).toBe("1m00s");
});
