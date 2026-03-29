import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { RafStub } from "tests/raf-stub";

export const rafStub = new RafStub();

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(rafStub.requestAnimationFrame);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(rafStub.cancelAnimationFrame);
});

afterEach(() => {
  rafStub.reset();
  vi.restoreAllMocks();
});

test("starts animation frame loop", () => {
  const onAnimate = vi.fn();

  const { rerender } = renderHook((isPlaying: boolean) => useAnimationFrame(isPlaying, onAnimate), {
    initialProps: true,
  });
  rafStub.step();
  rafStub.step();
  rafStub.step();
  expect(onAnimate).toBeCalledTimes(3);
  expect(rafStub.cancelAnimationFrame).toHaveBeenCalledTimes(0);
  rerender(false);
  // unmount + if
  expect(rafStub.cancelAnimationFrame).toHaveBeenCalledTimes(2);
});

test("not called when not playing", () => {
  const onAnimate = vi.fn();
  renderHook(() => useAnimationFrame(false, onAnimate));
  rafStub.step();
  rafStub.step();
  rafStub.step();

  expect(onAnimate).not.toHaveBeenCalled();
  expect(rafStub.cancelAnimationFrame).toHaveBeenCalledTimes(0);
});

test("calls onAnimate when tab becomes visible", () => {
  const onAnimate = vi.fn();
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  renderHook(() => useAnimationFrame(true, onAnimate));

  // Initial RAF call
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Simulate tab becoming visible
  document.dispatchEvent(new Event("visibilitychange"));

  expect(onAnimate).toHaveBeenCalledTimes(2);
  hiddenSpy.mockRestore();
});

test("does not call onAnimate when tab becomes hidden", () => {
  const onAnimate = vi.fn();
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  renderHook(() => useAnimationFrame(true, onAnimate));

  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Simulate tab becoming hidden
  hiddenSpy.mockReturnValue(true);
  document.dispatchEvent(new Event("visibilitychange"));

  // Should not be called again
  expect(onAnimate).toHaveBeenCalledTimes(1);
  hiddenSpy.mockRestore();
});

test("does not respond to visibilitychange when not playing", () => {
  const onAnimate = vi.fn();
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  renderHook(() => useAnimationFrame(false, onAnimate));

  document.dispatchEvent(new Event("visibilitychange"));

  expect(onAnimate).not.toHaveBeenCalled();
  hiddenSpy.mockRestore();
});

test("throttles to 30fps when fps is specified", () => {
  const onAnimate = vi.fn();

  // 30fps = ~33.3ms interval, RafStub steps at ~16.67ms (60fps)
  renderHook(() => useAnimationFrame(true, onAnimate, 30));

  // Step 1: ~16.67ms - first call always fires
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Step 2: ~33.3ms - not enough time since last call (need 33.3ms)
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Step 3: ~50.0ms - enough elapsed, fires
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(2);

  // Step 4: ~66.7ms - not enough
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(2);

  // Step 5: ~83.3ms - fires
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(3);
});

test("throttles to 24fps when fps is specified", () => {
  const onAnimate = vi.fn();

  // 24fps = ~41.67ms interval
  renderHook(() => useAnimationFrame(true, onAnimate, 24));

  // Step 1: ~16.67ms - first call
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Step 2: ~33.3ms - skip (16.67ms elapsed < 41.67ms)
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Step 3: ~50.0ms - skip (33.3ms elapsed < 41.67ms)
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Step 4: ~66.7ms - fires (50ms elapsed > 41.67ms)
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(2);
});

test("does not throttle at 60fps (matches RAF rate)", () => {
  const onAnimate = vi.fn();

  renderHook(() => useAnimationFrame(true, onAnimate, 60));

  rafStub.step();
  rafStub.step();
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(3);
});
