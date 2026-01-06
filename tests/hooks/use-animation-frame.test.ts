import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { RafStub } from "../raf-stub";

let rafStub: RafStub;

beforeEach(() => {
  rafStub = new RafStub();
  vi.clearAllMocks();
  vi.stubGlobal("requestAnimationFrame", rafStub.requestAnimationFrame);
  vi.stubGlobal("cancelAnimationFrame", rafStub.cancelAnimationFrame);
});

afterEach(() => {
  rafStub.reset();
  vi.unstubAllGlobals();
});

test("starts animation frame loop", () => {
  const onAnimate = vi.fn();

  renderHook(() => useAnimationFrame(true, onAnimate));
  rafStub.step();
  rafStub.step();
  rafStub.step();

  expect(onAnimate).toBeCalledTimes(3);
});

test("not called when not playing", () => {
  const onAnimate = vi.fn();

  renderHook(() => useAnimationFrame(false, onAnimate));
  // rafStub.step();
  // rafStub.step();
  // rafStub.step();

  expect(onAnimate).not.toHaveBeenCalled();
});
