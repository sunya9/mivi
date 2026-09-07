import { expect, test } from "vitest";

import { mergeShared } from "@/lib/store/merge-shared";

const prev = {
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  pianoRoll: { timeWindow: 2, effects: { ripple: true } },
  comet: { angle: 45 },
};

test("returns the same object when nothing changes", () => {
  expect(mergeShared(prev, {})).toBe(prev);
  expect(mergeShared(prev, { fps: 30 })).toBe(prev);
  expect(mergeShared(prev, { pianoRoll: { effects: { ripple: true } } })).toBe(prev);
});

test("replaces only the path that changed and keeps the other branches", () => {
  const next = mergeShared(prev, { pianoRoll: { effects: { ripple: false } } });

  expect(next).not.toBe(prev);
  expect(next.pianoRoll).not.toBe(prev.pianoRoll);
  expect(next.pianoRoll.effects).toEqual({ ripple: false });
  expect(next.pianoRoll.timeWindow).toBe(2);
  expect(next.resolution).toBe(prev.resolution);
  expect(next.comet).toBe(prev.comet);
  expect(prev.pianoRoll.effects.ripple).toBe(true);
});

test("assigns non-object values and skips undefined", () => {
  const resolution = { width: 1280, height: 720 };
  const next = mergeShared(prev, { fps: 60, resolution, comet: undefined });

  expect(next.fps).toBe(60);
  expect(next.resolution).toEqual(resolution);
  expect(next.resolution).not.toBe(prev.resolution);
  expect(next.comet).toBe(prev.comet);
});
