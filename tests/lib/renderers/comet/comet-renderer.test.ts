import { expect, test, vi } from "vitest";

import { MidiNote, MidiTrack, getDefaultTrackConfig } from "@/lib/midi/midi";
import { createCometRenderer } from "@/lib/renderers/comet/comet-renderer";
import {
  RendererConfig,
  getDefaultRendererConfig,
  CometConfig,
} from "@/lib/renderers/renderer-config";

function makeNote(id: number, midi: number, time: number, duration: number): MidiNote {
  return { id, midi, time, duration, velocity: 100, name: "", ticks: 0, durationTicks: 0 };
}

function makeTrack(notes: MidiNote[], overrides: Partial<MidiTrack["config"]> = {}): MidiTrack {
  return {
    id: "t",
    sourceIndex: 0,
    config: { ...getDefaultTrackConfig("t", "#204080"), ...overrides },
    notes,
  };
}

function setup(overrides: Partial<CometConfig> = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const defaults = getDefaultRendererConfig();
  const config: RendererConfig = {
    ...defaults,
    type: "comet",
    resolution: { width: 800, height: 600, label: "800×600" },
    cometConfig: { ...defaults.cometConfig, fallDuration: 2, fadeOutDuration: 0.5, ...overrides },
  };
  const render = createCometRenderer(ctx);
  const arcsAfter = (tracks: MidiTrack[], history: number[]) => {
    for (const time of history) {
      vi.mocked(ctx.arc).mockClear();
      render(tracks, time, config);
    }
    return vi.mocked(ctx.arc).mock.calls;
  };
  return { ctx, config, render, arcsAfter };
}

const track = makeTrack([makeNote(1, 60, 2, 0.5)]);

test("draws a comet from the note start until the fall and fade are over", () => {
  const { arcsAfter } = setup();
  expect(arcsAfter([track], [1.9])).toHaveLength(0);
  expect(arcsAfter([track], [2])).not.toHaveLength(0);
  expect(arcsAfter([track], [4.4])).not.toHaveLength(0);
  expect(arcsAfter([track], [4.6])).toHaveLength(0);
});

test("draws a comet mid-flight when scrubbing straight to a time after the note ended", () => {
  const { arcsAfter } = setup();
  expect(arcsAfter([track], [2.7])).not.toHaveLength(0);
});

test("draws a comet for a note shorter than a frame", () => {
  const { arcsAfter } = setup();
  const shortNote = makeTrack([makeNote(1, 60, 2, 0.01)]);
  expect(arcsAfter([shortNote], [2.05])).not.toHaveLength(0);
});

test("renders the same frame no matter which frames were rendered before", () => {
  const expected = setup().arcsAfter([track], [2.7]);
  const actual = setup().arcsAfter([track], [2.0, 2.3, 2.7]);
  expect(actual).toEqual(expected);
});

test("moves the comet along the fall angle over time", () => {
  const { arcsAfter } = setup({ fallAngle: 0, angleRandomness: 0 });
  const [[startX, startY]] = arcsAfter([track], [2]);
  const [[laterX, laterY]] = arcsAfter([track], [3]);
  expect(laterX).toBeGreaterThan(startX);
  expect(laterY).toBeCloseTo(startY);
});

test("skips notes outside the view range", () => {
  const { arcsAfter } = setup({ viewRangeBottom: 70, viewRangeTop: 80 });
  expect(arcsAfter([track], [2.2])).toHaveLength(0);
});

test("skips hidden tracks", () => {
  const { arcsAfter } = setup();
  expect(arcsAfter([makeTrack(track.notes, { visible: false })], [2.2])).toHaveLength(0);
});

test("only visits notes whose comet can still be visible", () => {
  const { arcsAfter } = setup();
  const many = makeTrack(Array.from({ length: 50 }, (_, i) => makeNote(i, 60, i * 0.1, 0.05)));
  const visible = arcsAfter([many], [4]);
  const lifetime = 2 + 0.5;
  const expectedNotes = many.notes.filter((n) => n.time <= 4 && n.time > 4 - lifetime);
  expect(visible.length).toBe(expectedNotes.length * 2);
});
