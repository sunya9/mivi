import { useFpsCounter } from "@/hooks/use-fps-counter";
import { customRenderHook } from "tests/util";
import { test, expect, vi, afterEach } from "vitest";

function setupHook() {
  vi.useFakeTimers();
  return customRenderHook(() => useFpsCounter());
}

afterEach(() => {
  vi.useRealTimers();
});

test("fps is 0 initially", () => {
  const { result } = setupHook();
  expect(result.current.fps).toBe(0);
});

test("calculates fps after 1 second of ticks", () => {
  const { result, rerender } = setupHook();

  for (let i = 0; i < 50; i++) {
    vi.advanceTimersByTime(21);
    result.current.tick();
  }
  rerender();

  // 50 frames over 1050ms → ~48fps
  expect(result.current.fps).toBeGreaterThanOrEqual(45);
  expect(result.current.fps).toBeLessThanOrEqual(50);
});

test("does not update fps before 1 second", () => {
  const { result, rerender } = setupHook();

  for (let i = 0; i < 10; i++) {
    vi.advanceTimersByTime(50);
    result.current.tick();
  }
  rerender();

  expect(result.current.fps).toBe(0);
});

test("reset clears fps to 0", () => {
  const { result, rerender } = setupHook();

  for (let i = 0; i < 50; i++) {
    vi.advanceTimersByTime(21);
    result.current.tick();
  }
  rerender();
  expect(result.current.fps).toBeGreaterThan(0);

  result.current.reset();
  rerender();
  expect(result.current.fps).toBe(0);
});

test("recalculates fps after reset", () => {
  const { result, rerender } = setupHook();

  // First: ~48fps
  for (let i = 0; i < 50; i++) {
    vi.advanceTimersByTime(21);
    result.current.tick();
  }
  rerender();

  result.current.reset();
  rerender();

  // Second: ~29fps (31 ticks at 34ms = 1054ms)
  for (let i = 0; i < 31; i++) {
    vi.advanceTimersByTime(34);
    result.current.tick();
  }
  rerender();

  expect(result.current.fps).toBeGreaterThanOrEqual(27);
  expect(result.current.fps).toBeLessThanOrEqual(32);
});
