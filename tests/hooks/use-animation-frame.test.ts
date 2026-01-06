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
