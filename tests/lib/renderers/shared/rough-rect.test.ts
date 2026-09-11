import { expect, test, vi } from "vitest";

import { drawRoughRect } from "@/lib/renderers/shared/rough-rect";

function setup() {
  const canvas = document.createElement("canvas");
  return canvas.getContext("2d")!;
}

test("outlines a closed path around the rectangle", () => {
  const ctx = setup();
  drawRoughRect(ctx, 10, 20, 100, 40, 4, 1.5, 4, 7);
  expect(ctx.beginPath).toHaveBeenCalledOnce();
  expect(ctx.closePath).toHaveBeenCalledOnce();
  expect(ctx.arcTo).toHaveBeenCalledTimes(4);
  expect(vi.mocked(ctx.lineTo).mock.calls.length).toBeGreaterThan(4);
});

test("draws the same edges for the same seed", () => {
  const first = setup();
  const second = setup();
  drawRoughRect(first, 10, 20, 100, 40, 4, 1.5, 4, 7);
  drawRoughRect(second, 10, 20, 100, 40, 4, 1.5, 4, 7);
  expect(vi.mocked(second.lineTo).mock.calls).toEqual(vi.mocked(first.lineTo).mock.calls);
});

test("draws different edges for different seeds", () => {
  const first = setup();
  const second = setup();
  drawRoughRect(first, 10, 20, 100, 40, 4, 1.5, 4, 7);
  drawRoughRect(second, 10, 20, 100, 40, 4, 1.5, 4, 8);
  expect(vi.mocked(second.lineTo).mock.calls).not.toEqual(vi.mocked(first.lineTo).mock.calls);
});
