import { testMidiTracks } from "tests/fixtures";
import { expect, test, vi } from "vitest";

import { RendererConfig, getDefaultRendererConfig } from "@/lib/renderers/renderer";
import { VerticalPianoRollRenderer } from "@/lib/renderers/vertical-piano-roll/vertical-piano-roll-renderer";

function setup(overrides: Partial<RendererConfig["verticalPianoRollConfig"]> = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const defaults = getDefaultRendererConfig();
  const config: RendererConfig = {
    ...defaults,
    type: "verticalPianoRoll",
    resolution: { width: 800, height: 600, label: "800×600" },
    verticalPianoRollConfig: { ...defaults.verticalPianoRollConfig, ...overrides },
  };
  const renderer = new VerticalPianoRollRenderer(ctx, config);
  return { ctx, renderer };
}

const tracks = testMidiTracks.tracks;

test("renders every frame of a playback and a rewind without throwing", () => {
  const { renderer } = setup({ showRoughEdge: true, showNoiseTexture: true });
  for (let t = 0; t <= 4.5; t += 0.1) {
    renderer.render(tracks, t);
  }
  expect(() => renderer.render(tracks, 0)).not.toThrow();
});

test("clips the falling area once per frame", () => {
  const { ctx, renderer } = setup();
  renderer.render(tracks, 1.1);
  expect(ctx.clip).toHaveBeenCalledTimes(1);
});

test("draws an octave label for each C in the view range", () => {
  const { ctx, renderer } = setup({ viewRangeBottom: 60, viewRangeTop: 72 });
  renderer.render(tracks, 1.1);
  expect(ctx.fillText).toHaveBeenCalledTimes(2);
  expect(ctx.fillText).toHaveBeenCalledWith("C4", expect.any(Number), expect.any(Number));
  expect(ctx.fillText).toHaveBeenCalledWith("C5", expect.any(Number), expect.any(Number));
});

test("skips octave labels when disabled", () => {
  const { ctx, renderer } = setup({ showOctaveLabels: false });
  renderer.render(tracks, 1.1);
  expect(ctx.fillText).not.toHaveBeenCalled();
});

test("draws notes that fall within the view range", () => {
  const { ctx, renderer } = setup({ viewRangeBottom: 60, viewRangeTop: 72 });
  renderer.render(tracks, 1.1);
  expect(ctx.roundRect).toHaveBeenCalled();
});

test("does not draw notes outside the view range", () => {
  const { ctx, renderer } = setup({ viewRangeBottom: 24, viewRangeTop: 36 });
  renderer.render(tracks, 1.1);
  expect(ctx.roundRect).not.toHaveBeenCalled();
});

test("skips hidden tracks", () => {
  const { ctx, renderer } = setup();
  const hidden = tracks.map((track) => ({
    ...track,
    config: { ...track.config, visible: false },
  }));
  renderer.render(hidden, 1.1);
  expect(ctx.roundRect).not.toHaveBeenCalled();
});

test("draws key lane lines as a single stroke when enabled", () => {
  const base = {
    showOctaveLines: false,
    showHitLine: false,
    showRippleEffect: false,
  };
  const on = setup({ ...base, showKeyLines: true });
  on.renderer.render(tracks, 1.1);
  expect(on.ctx.stroke).toHaveBeenCalledTimes(1);

  const off = setup({ ...base, showKeyLines: false });
  off.renderer.render(tracks, 1.1);
  expect(off.ctx.stroke).not.toHaveBeenCalled();
});

test("hit line grows upward from the keyboard top edge", () => {
  const { ctx, renderer } = setup({ keyboardHeight: 15, hitLineWidth: 6 });
  renderer.render(tracks, 1.1);
  const hitLineY = 600 * 0.85;
  expect(ctx.fillRect).toHaveBeenCalledWith(0, hitLineY - 6, 800, 6);
});

test("vertical margin shortens notes at both ends", () => {
  const { ctx, renderer } = setup({
    viewRangeBottom: 60,
    viewRangeTop: 72,
    noteMargin: 0,
    noteVerticalMargin: 3,
    timeWindow: 3,
    keyboardHeight: 15,
    showRoughEdge: false,
  });
  renderer.render(tracks, 0);
  // C4 lasts 0.5s from t=0: 85px tall at 170px/s, minus 3px at each end
  expect(ctx.roundRect).toHaveBeenCalledWith(0, 428, 100, 79, 2);
});

test("black key notes are drawn after white key notes so they stay in front", () => {
  const { ctx, renderer } = setup({ viewRangeBottom: 60, viewRangeTop: 72, noteMargin: 0 });
  const track = {
    ...tracks[0],
    notes: [
      { ...tracks[0].notes[0], id: 100, midi: 66, time: 0.2 },
      { ...tracks[0].notes[0], id: 101, midi: 64, time: 0.3 },
    ],
  };
  renderer.render([track], 0);
  const xs = vi.mocked(ctx.roundRect).mock.calls.map(([x]) => x);
  expect(xs).toEqual([200, 370]);
});
