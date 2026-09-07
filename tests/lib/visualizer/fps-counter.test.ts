import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { FpsCounter } from "@/lib/visualizer/fps-counter";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function tickFor(counter: FpsCounter, frames: number, intervalMs: number) {
  for (let i = 0; i < frames; i++) {
    vi.advanceTimersByTime(intervalMs);
    counter.tick();
  }
}

test("fps is 0 initially", () => {
  expect(new FpsCounter().getSnapshot()).toBe(0);
});

test("calculates fps after 1 second of ticks", () => {
  const counter = new FpsCounter();
  tickFor(counter, 50, 21);
  // 50 frames over 1050ms → ~48fps
  expect(counter.getSnapshot()).toBeGreaterThanOrEqual(45);
  expect(counter.getSnapshot()).toBeLessThanOrEqual(50);
});

test("does not update fps before 1 second", () => {
  const counter = new FpsCounter();
  tickFor(counter, 10, 50);
  expect(counter.getSnapshot()).toBe(0);
});

test("reset clears fps to 0 and starts a fresh window", () => {
  const counter = new FpsCounter();
  tickFor(counter, 50, 21);
  expect(counter.getSnapshot()).toBeGreaterThan(0);

  counter.reset();
  expect(counter.getSnapshot()).toBe(0);

  // 31 ticks at 34ms = 1054ms → ~29fps
  tickFor(counter, 31, 34);
  expect(counter.getSnapshot()).toBeGreaterThanOrEqual(27);
  expect(counter.getSnapshot()).toBeLessThanOrEqual(32);
});

test("notifies subscribers only when the fps value changes", () => {
  const counter = new FpsCounter();
  const listener = vi.fn<() => void>();
  const unsubscribe = counter.subscribe(listener);

  tickFor(counter, 10, 50);
  expect(listener).not.toHaveBeenCalled();

  tickFor(counter, 40, 21);
  expect(listener).toHaveBeenCalledOnce();

  counter.reset();
  expect(listener).toHaveBeenCalledTimes(2);

  counter.reset();
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  tickFor(counter, 50, 21);
  expect(listener).toHaveBeenCalledTimes(2);
});
