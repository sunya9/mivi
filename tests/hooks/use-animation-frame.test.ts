import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { RafStub } from "../raf-stub";

const rafStub = new RafStub();

beforeEach(() => {
  vi.clearAllMocks();
  global.window.requestAnimationFrame = rafStub.requestAnimationFrame;
  global.window.cancelAnimationFrame = rafStub.cancelAnimationFrame;
});

afterEach(() => {
  rafStub.reset();
});

test("starts animation frame loop", () => {
  const onAnimate = vi.fn();

  renderHook(() => useAnimationFrame(onAnimate));
  rafStub.step();
  rafStub.step();
  rafStub.step();

  expect(onAnimate).toBeCalledTimes(3);
});
