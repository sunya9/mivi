import { expect, test, onTestFinished } from "vitest";
import { page } from "vitest/browser";

import { MidiNote, MidiTrack, getDefaultTrackConfig } from "@/lib/midi/midi";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import { RendererConfig, getDefaultRendererConfig } from "@/lib/renderers/renderer";
import type { Resolution } from "@/lib/renderers/renderer";
import { VerticalPianoRollRenderer } from "@/lib/renderers/vertical-piano-roll/vertical-piano-roll-renderer";

const WIDTH = 800;
const HEIGHT = 600;
const resolution: Resolution = {
  width: WIDTH,
  height: HEIGHT,
  label: `${WIDTH}×${HEIGHT}`,
};

// Falling notes, a sounding note, and a mid-animation ripple/flash all land in this frame
const CAPTURE_TIME = 1.1;

function makeNote(id: number, midi: number, time: number, duration: number): MidiNote {
  return { id, midi, time, duration, name: "", ticks: 0, durationTicks: 0, velocity: 0.8 };
}

const tracks: MidiTrack[] = [
  {
    id: "melody",
    config: getDefaultTrackConfig("Melody", "#3b82f6"),
    notes: [
      makeNote(0, 60, 0, 0.5),
      makeNote(1, 62, 0.5, 0.5),
      makeNote(2, 64, 1, 0.5),
      makeNote(3, 66, 1.5, 0.5),
      makeNote(4, 67, 2, 0.25),
      makeNote(5, 70, 2.25, 0.25),
      makeNote(6, 72, 2.5, 1),
    ],
  },
  {
    id: "bass",
    config: getDefaultTrackConfig("Bass", "#f59e0b"),
    notes: [makeNote(10, 36, 0, 4), makeNote(11, 43, 1, 0.1), makeNote(12, 48, 1.75, 0.5)],
  },
];

function createTestCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.setAttribute("data-testid", "vrt-canvas");
  document.body.appendChild(canvas);
  return canvas;
}

function renderScene(overrides: Partial<RendererConfig["verticalPianoRollConfig"]>) {
  const canvas = createTestCanvas();
  onTestFinished(() => canvas.remove());
  const ctx = canvas.getContext("2d")!;
  const defaults = getDefaultRendererConfig();
  const config: RendererConfig = {
    ...defaults,
    type: "verticalPianoRoll",
    backgroundImageEnabled: false,
    resolution,
    verticalPianoRollConfig: {
      ...defaults.verticalPianoRollConfig,
      // Text rendering differs between macOS and Linux CI, so labels are covered by unit tests
      showOctaveLabels: false,
      ...overrides,
    },
  };
  new BackgroundRenderer(ctx, config).render();
  new VerticalPianoRollRenderer(ctx, config).render(tracks, CAPTURE_TIME);
}

test("default settings", async () => {
  renderScene({});
  await expect(page.getByTestId("vrt-canvas")).toMatchScreenshot("vertical-piano-roll-default");
});

test("narrow view range with taller keyboard", async () => {
  renderScene({ viewRangeBottom: 55, viewRangeTop: 79, keyboardHeight: 25 });
  await expect(page.getByTestId("vrt-canvas")).toMatchScreenshot(
    "vertical-piano-roll-narrow-range",
  );
});

test("rough edge and noise texture", async () => {
  renderScene({
    viewRangeBottom: 48,
    viewRangeTop: 84,
    showRoughEdge: true,
    showNoiseTexture: true,
    noiseIntensity: 0.4,
  });
  await expect(page.getByTestId("vrt-canvas")).toMatchScreenshot("vertical-piano-roll-rough-noise");
});
