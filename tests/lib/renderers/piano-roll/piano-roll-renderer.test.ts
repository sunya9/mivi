import { expect, test, vi } from "vitest";

import { MidiTrack, getDefaultTrackConfig } from "@/lib/midi/midi";
import { createPianoRollRenderer } from "@/lib/renderers/piano-roll/piano-roll-renderer";
import { RendererConfig, getDefaultRendererConfig } from "@/lib/renderers/renderer";

const track: MidiTrack = {
  id: "t",
  sourceIndex: 0,
  config: getDefaultTrackConfig("t"),
  notes: [
    {
      id: 1,
      midi: 60,
      time: 2,
      duration: 0.5,
      velocity: 1,
      name: "C4",
      ticks: 0,
      durationTicks: 0,
    },
  ],
};

function setup(overrides: Partial<RendererConfig["pianoRollConfig"]> = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const defaults = getDefaultRendererConfig();
  const config: RendererConfig = {
    ...defaults,
    type: "pianoRoll",
    resolution: { width: 800, height: 600, label: "800×600" },
    pianoRollConfig: { ...defaults.pianoRollConfig, ...overrides },
  };
  const render = createPianoRollRenderer(ctx);
  const noteYAt = (time: number) => {
    vi.mocked(ctx.roundRect).mockClear();
    render([track], time, config);
    return vi.mocked(ctx.roundRect).mock.calls[0][1];
  };
  return { ctx, config, render, noteYAt };
}

test("keeps an unpressed note at the same y across frames", () => {
  const { noteYAt } = setup({
    showNotePressEffect: true,
    notePressDepth: 4,
    pressAnimationDuration: 0.1,
  });
  const ys = new Set<number>();
  for (let frame = 0; frame < 20; frame++) {
    ys.add(noteYAt(frame / 60));
  }
  expect(ys.size).toBe(1);
});

test("keeps a released note at its resting y once the release animation ends", () => {
  const { noteYAt } = setup({
    showNotePressEffect: true,
    notePressDepth: 4,
    pressAnimationDuration: 0.1,
  });
  const restingY = noteYAt(0);
  noteYAt(2.1);
  const ys = new Set<number>();
  for (let frame = 0; frame < 20; frame++) {
    ys.add(noteYAt(3 + frame / 60));
  }
  expect(ys).toEqual(new Set([restingY]));
});

test("sinks a pressed note by notePressDepth once the press animation completes", () => {
  const { noteYAt } = setup({
    showNotePressEffect: true,
    notePressDepth: 4,
    pressAnimationDuration: 0.1,
  });
  const restingY = noteYAt(0);
  expect(noteYAt(2.2)).toBeCloseTo(restingY + 4);
});

test("renders the same y for a time no matter which direction playback reached it", () => {
  const times = Array.from({ length: 40 }, (_, i) => 1.9 + i * 0.025);
  const forward = setup({ showNotePressEffect: true });
  const backward = setup({ showNotePressEffect: true });
  const forwardYs = times.map((t) => forward.noteYAt(t));
  const backwardYs = times
    .toReversed()
    .map((t) => backward.noteYAt(t))
    .toReversed();
  expect(backwardYs).toEqual(forwardYs);
});

test("applies the config passed to each frame without rebuilding the renderer", () => {
  const { ctx, config, render } = setup({ showPlayhead: false });
  render([track], 0, config);
  expect(ctx.stroke).not.toHaveBeenCalled();

  render([track], 0, {
    ...config,
    pianoRollConfig: { ...config.pianoRollConfig, showPlayhead: true },
  });
  expect(ctx.stroke).toHaveBeenCalledTimes(1);
});
