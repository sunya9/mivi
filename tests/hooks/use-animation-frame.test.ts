import { test, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { rafStub } from "tests/setup";

test("starts animation frame loop", () => {
  const onAnimate = vi.fn();

  const { rerender } = renderHook(
    (isPlaying: boolean) => useAnimationFrame(isPlaying, onAnimate),
    {
      initialProps: true,
    },
  );
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
