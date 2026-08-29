import { renderHook } from "@testing-library/react";
import { RafStub } from "tests/raf-stub";
import { test, expect, vi, beforeEach, afterEach } from "vitest";

import { useAnimationFrame } from "@/hooks/use-animation-frame";

export const rafStub = new RafStub();

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(rafStub.requestAnimationFrame);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(rafStub.cancelAnimationFrame);
});

afterEach(() => {
  rafStub.reset();
  vi.restoreAllMocks();
});

function renderAnimationFrame(isPlaying: boolean, fps?: number) {
  const onAnimate = vi.fn<Parameters<typeof useAnimationFrame>[1]>();
  const { rerender } = renderHook(
    (playing: boolean) => useAnimationFrame(playing, onAnimate, fps),
    { initialProps: isPlaying },
  );
  return { onAnimate, rerender };
}

test("starts animation frame loop", () => {
  const { onAnimate, rerender } = renderAnimationFrame(true);

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
  const { onAnimate } = renderAnimationFrame(false);
  rafStub.step();
  rafStub.step();
  rafStub.step();

  expect(onAnimate).not.toHaveBeenCalled();
  expect(rafStub.cancelAnimationFrame).toHaveBeenCalledTimes(0);
});

test("calls onAnimate when tab becomes visible", () => {
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  const { onAnimate } = renderAnimationFrame(true);

  // Initial RAF call
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(1);

  // Simulate tab becoming visible
  document.dispatchEvent(new Event("visibilitychange"));

  expect(onAnimate).toHaveBeenCalledTimes(2);
  hiddenSpy.mockRestore();
});

test("does not call onAnimate when tab becomes hidden", () => {
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  const { onAnimate } = renderAnimationFrame(true);

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
  const hiddenSpy = vi.spyOn(document, "hidden", "get").mockReturnValue(false);

  const { onAnimate } = renderAnimationFrame(false);

  document.dispatchEvent(new Event("visibilitychange"));

  expect(onAnimate).not.toHaveBeenCalled();
  hiddenSpy.mockRestore();
});

test("throttles to 30fps when fps is specified", () => {
  // 30fps = ~33.3ms interval, RafStub steps at ~16.67ms (60fps)
  const { onAnimate } = renderAnimationFrame(true, 30);

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
  // 24fps = ~41.67ms interval
  const { onAnimate } = renderAnimationFrame(true, 24);

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
  const { onAnimate } = renderAnimationFrame(true, 60);

  rafStub.step();
  rafStub.step();
  rafStub.step();
  expect(onAnimate).toHaveBeenCalledTimes(3);
});
