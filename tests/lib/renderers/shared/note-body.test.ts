import { expect, test, vi } from "vitest";

import { MidiNote } from "@/lib/midi/midi";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer-config";
import { createNoiseTexture } from "@/lib/renderers/shared/noise-texture";
import { NoteBody, drawNoteBody, noteSeed } from "@/lib/renderers/shared/note-body";

function setup() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fillStyles: string[] = [];
  const alphas: number[] = [];
  Object.defineProperty(ctx, "fillStyle", {
    configurable: true,
    get: () => fillStyles.at(-1) ?? "",
    set: (value: string) => {
      fillStyles.push(value);
    },
  });
  Object.defineProperty(ctx, "globalAlpha", {
    configurable: true,
    get: () => alphas.at(-1) ?? 1,
    set: (value: number) => {
      alphas.push(value);
    },
  });
  const noiseTexture = { apply: vi.fn<ReturnType<typeof createNoiseTexture>["apply"]>() };
  const cfg = { ...getDefaultRendererConfig().pianoRollConfig, showRoughEdge: false };
  const body: NoteBody = {
    x: 10,
    y: 20,
    width: 100,
    height: 8,
    cornerRadius: 2,
    baseColor: "#204080",
    flashIntensity: 0,
    opacity: 0.5,
    velocity: 1,
    seed: 7,
  };
  return { ctx, fillStyles, alphas, noiseTexture, cfg, body };
}

test("fills the body in the base color at the track opacity, then overlays the velocity", () => {
  const { ctx, fillStyles, alphas, noiseTexture, cfg, body } = setup();
  drawNoteBody(ctx, noiseTexture, cfg, body);
  expect(fillStyles).toEqual(["#204080", "rgba(255, 255, 255, 0.3)"]);
  expect(alphas).toEqual([0.5]);
  expect(ctx.roundRect).toHaveBeenCalledExactlyOnceWith(10, 20, 100, 8, 2);
  expect(ctx.fill).toHaveBeenCalledTimes(2);
});

test("scales the velocity overlay with the normalized velocity", () => {
  const { ctx, fillStyles, noiseTexture, cfg, body } = setup();
  drawNoteBody(ctx, noiseTexture, cfg, { ...body, velocity: 0.5 });
  expect(fillStyles.at(-1)).toBe("rgba(255, 255, 255, 0.15)");
});

test("brightens the base color while the note flashes", () => {
  const { ctx, fillStyles, noiseTexture, cfg, body } = setup();
  drawNoteBody(ctx, noiseTexture, cfg, { ...body, flashIntensity: 0.5 });
  expect(fillStyles[0]).not.toBe("#204080");
  expect(fillStyles[0]).toMatch(/^rgb\(/);
});

test("outlines the body roughly when the rough edge is enabled", () => {
  const { ctx, noiseTexture, cfg, body } = setup();
  drawNoteBody(ctx, noiseTexture, { ...cfg, showRoughEdge: true }, body);
  expect(ctx.roundRect).not.toHaveBeenCalled();
  expect(ctx.arcTo).toHaveBeenCalledTimes(4);
  expect(ctx.fill).toHaveBeenCalledTimes(2);
});

test("textures the body with the base color and the note seed", () => {
  const { ctx, noiseTexture, cfg, body } = setup();
  drawNoteBody(ctx, noiseTexture, cfg, body);
  expect(noiseTexture.apply).toHaveBeenCalledExactlyOnceWith(cfg, "#204080", 10, 20, 7);
});

test("derives a stable seed from the note start and pitch", () => {
  const note = { time: 1.5, midi: 60 } as MidiNote;
  expect(noteSeed(note)).toBe(1560);
  expect(noteSeed({ ...note })).toBe(noteSeed(note));
});
