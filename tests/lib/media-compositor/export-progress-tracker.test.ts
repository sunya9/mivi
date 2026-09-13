import { test, expect, vi, afterEach } from "vitest";

import {
  ExportProgressTracker,
  type ActivePhase,
} from "@/lib/media-compositor/export-progress-tracker";

function setup(phases: { name: string; total: number }[]) {
  vi.useFakeTimers();
  const onProgress = vi.fn<(progress: number, activePhase?: ActivePhase) => void>();
  const tracker = new ExportProgressTracker(phases, onProgress);
  return { onProgress, tracker };
}

function flush() {
  vi.advanceTimersByTime(500);
}

afterEach(() => {
  vi.useRealTimers();
});

test("reports the fraction of a single phase", () => {
  const { onProgress, tracker } = setup([{ name: "render", total: 4 }]);

  tracker.set("render", 2);
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.5, expect.objectContaining({ name: "render" }));
});

test("reports the fraction of all phases combined", () => {
  const { onProgress, tracker } = setup([
    { name: "render", total: 5 },
    { name: "encode", total: 5 },
  ]);

  tracker.set("render", 5);
  tracker.set("encode", 3);
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.8, expect.objectContaining({ name: "encode" }));
});

test("the last declared phase still in progress is the active one", () => {
  const { onProgress, tracker } = setup([
    { name: "render", total: 5 },
    { name: "encode", total: 5 },
  ]);

  tracker.set("encode", 1);
  tracker.set("render", 2);
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.3, expect.objectContaining({ name: "encode" }));
});

test("a finished run reports 1 with no active phase", () => {
  const { onProgress, tracker } = setup([
    { name: "render", total: 5 },
    { name: "encode", total: 5 },
  ]);

  tracker.set("render", 5);
  tracker.set("encode", 5);
  flush();

  expect(onProgress).toHaveBeenCalledWith(1, undefined);
});

test("the phase timer starts when progress is first observed", () => {
  const { onProgress, tracker } = setup([{ name: "encode", total: 10 }]);

  tracker.set("encode", 1);
  flush();

  vi.advanceTimersByTime(2000);
  tracker.set("encode", 5);
  flush();

  const call = onProgress.mock.calls.at(-1);
  expect(call?.[1]?.etaSeconds).toBeCloseTo(3.125);
});

test("eta is unknown until progress advances past the first observation", () => {
  const { onProgress, tracker } = setup([{ name: "encode", total: 10 }]);

  tracker.set("encode", 3);
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.3, { name: "encode", etaSeconds: undefined });
});

test("eta is the remaining work divided by the observed rate", () => {
  const { onProgress, tracker } = setup([{ name: "render", total: 100 }]);

  tracker.set("render", 1);
  vi.advanceTimersByTime(10_000);
  tracker.set("render", 2);
  flush();

  const call = onProgress.mock.calls.at(-1);
  expect(call?.[1]?.etaSeconds).toBeCloseTo(980);
});

test("reports are throttled", () => {
  const { onProgress, tracker } = setup([{ name: "render", total: 10 }]);

  tracker.set("render", 1);
  tracker.set("render", 2);
  tracker.set("render", 3);
  flush();

  expect(onProgress).toHaveBeenCalledTimes(2);
  expect(onProgress).toHaveBeenLastCalledWith(0.3, expect.objectContaining({ name: "render" }));
});
