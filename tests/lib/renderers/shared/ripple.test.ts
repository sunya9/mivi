import { expect, test, vi } from "vitest";

import { PendingRipple, drawPendingRipples, drawRipple } from "@/lib/renderers/shared/ripple";

function setup() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const alphas: number[] = [];
  Object.defineProperty(ctx, "globalAlpha", {
    configurable: true,
    get: () => alphas.at(-1) ?? 1,
    set: (value: number) => {
      alphas.push(value);
    },
  });
  return { ctx, alphas };
}

test("draws a stroked and filled circle at the given alpha", () => {
  const { ctx, alphas } = setup();
  drawRipple(ctx, 10, 20, 30, "#204080", 0.2);
  expect(ctx.arc).toHaveBeenCalledExactlyOnceWith(10, 20, 30, 0, Math.PI * 2);
  expect(ctx.stroke).toHaveBeenCalledOnce();
  expect(ctx.fill).toHaveBeenCalledOnce();
  expect(alphas).toEqual([0.2]);
});

test("skips ripples that are fully faded or have no radius", () => {
  const { ctx } = setup();
  drawRipple(ctx, 10, 20, 30, "#204080", 0);
  drawRipple(ctx, 10, 20, -1, "#204080", 0.5);
  expect(ctx.arc).not.toHaveBeenCalled();
});

test("expands and fades each pending ripple by its progress and track opacity", () => {
  const { ctx, alphas } = setup();
  const ripples: PendingRipple[] = [
    { x: 1, y: 2, progress: 0.5, color: "#204080", opacity: 1 },
    { x: 3, y: 4, progress: 0.25, color: "#ffffff", opacity: 0.5 },
  ];
  drawPendingRipples(ctx, ripples, 40);
  expect(vi.mocked(ctx.arc).mock.calls.map(([x, y, r]) => [x, y, r])).toEqual([
    [1, 2, 20],
    [3, 4, 10],
  ]);
  expect(alphas).toHaveLength(2);
  expect(alphas[0]).toBeCloseTo(0.2);
  expect(alphas[1]).toBeCloseTo(0.15);
});

test("draws nothing for a ripple on a fully transparent track", () => {
  const { ctx } = setup();
  drawPendingRipples(ctx, [{ x: 1, y: 2, progress: 0.5, color: "#204080", opacity: 0 }], 40);
  expect(ctx.arc).not.toHaveBeenCalled();
});
