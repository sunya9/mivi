import { testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import { createRenderer } from "@/lib/renderers/create-renderer";
import { RendererType, getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

const tracks = testMidiTracks.tracks;

function setup(type: RendererType) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const config = { ...getDefaultRendererConfig(), type };
  return { ctx, config };
}

test("none renderer leaves the canvas untouched", () => {
  const { ctx, config } = setup("none");
  createRenderer("none", ctx)(tracks, 0.1, config);
  expect(ctx.fill).not.toHaveBeenCalled();
  expect(ctx.stroke).not.toHaveBeenCalled();
});

test.each<[RendererType, "roundRect" | "clip" | "arc"]>([
  ["pianoRoll", "roundRect"],
  ["verticalPianoRoll", "clip"],
  ["comet", "arc"],
])("%s renderer draws through the given context", (type, method) => {
  const { ctx, config } = setup(type);
  createRenderer(type, ctx)(tracks, 0.1, config);
  expect(ctx[method]).toHaveBeenCalled();
});

test("each call builds an independent renderer", () => {
  const { ctx, config } = setup("pianoRoll");
  const first = createRenderer("pianoRoll", ctx);
  const second = createRenderer("pianoRoll", ctx);
  expect(first).not.toBe(second);
  expect(() => first(tracks, 0.1, config)).not.toThrow();
  expect(() => second(tracks, 0.1, config)).not.toThrow();
});
