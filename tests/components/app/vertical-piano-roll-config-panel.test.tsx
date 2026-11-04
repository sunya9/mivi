import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { customRender, nudgeSlider, pickColor } from "tests/util";
import { expect, test, vi } from "vitest";

import { VerticalPianoRollConfigPanel } from "@/components/app/vertical-piano-roll-config-panel";

type Props = ComponentProps<typeof VerticalPianoRollConfigPanel>;
const onChange: Props["onChange"] = vi.fn<Props["onChange"]>();
const verticalPianoRollConfig = rendererConfig.verticalPianoRollConfig;

async function renderPane(overrideProps?: Partial<Props>) {
  await customRender(
    <VerticalPianoRollConfigPanel
      onChange={onChange}
      config={verticalPianoRollConfig}
      minNote={testMidiTracks.minNote}
      maxNote={testMidiTracks.maxNote}
      {...overrideProps}
    />,
  );
}

test("renders time window and keyboard height labels", async () => {
  await renderPane();
  expect(
    screen.getByText(`Time Window: ${verticalPianoRollConfig.timeWindow}s`),
  ).toBeInTheDocument();
  expect(
    screen.getByText(`Keyboard Height: ${verticalPianoRollConfig.keyboardHeight}%`),
  ).toBeInTheDocument();
});

test("displays detected note range when provided", async () => {
  await renderPane();
  expect(screen.getByText(/Detected range: 60 - 72/)).toBeInTheDocument();
});

test("displays detected note range when the lowest note is 0", async () => {
  await renderPane({ minNote: 0, maxNote: 12 });
  expect(screen.getByText(/Detected range: 0 - 12/)).toBeInTheDocument();
});

test("does not display detected note range without midi", async () => {
  await renderPane({ minNote: undefined, maxNote: undefined });
  expect(screen.queryByText(/Detected range/)).not.toBeInTheDocument();
});

test("toggle key press highlight", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Key Press Highlight" }));
  expect(onChange).toHaveBeenCalledWith({ showKeyPressHighlight: false });
});

test("toggle darken black key notes", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Darken Black Key Notes" }));
  expect(onChange).toHaveBeenCalledWith({ darkenBlackKeyNotes: false });
});

test("black key note darkness slider is hidden when darkening is off", async () => {
  await renderPane({
    config: { ...verticalPianoRollConfig, darkenBlackKeyNotes: false },
  });
  expect(screen.queryByText(/Black Key Note Darkness/)).not.toBeInTheDocument();
});

test("black key note darkness slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Black Key Note Darkness: ${Math.round(verticalPianoRollConfig.blackKeyNoteDarkness * 100)}%`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    blackKeyNoteDarkness: verticalPianoRollConfig.blackKeyNoteDarkness + 0.05,
  });
});

test("toggle octave labels", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Octave Labels" }));
  expect(onChange).toHaveBeenCalledWith({ showOctaveLabels: false });
});

test("toggle key lines", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Key Lines" }));
  expect(onChange).toHaveBeenCalledWith({ showKeyLines: false });
});

test("key line color and opacity are shown only while key lines are on", async () => {
  await renderPane();
  expect(screen.getByText("Key Line Color")).toBeInTheDocument();
  expect(screen.getByText(/Key Line Opacity/)).toBeInTheDocument();
});

test("key line color and opacity are hidden when key lines are off", async () => {
  await renderPane({
    config: { ...verticalPianoRollConfig, showKeyLines: false },
  });
  expect(screen.queryByText("Key Line Color")).not.toBeInTheDocument();
  expect(screen.queryByText(/Key Line Opacity/)).not.toBeInTheDocument();
});

test("octave line color is shown only while octave lines are on", async () => {
  await renderPane();
  expect(screen.getByText("Octave Line Color")).toBeInTheDocument();
});

test("octave line color is hidden when octave lines are off", async () => {
  await renderPane({
    config: { ...verticalPianoRollConfig, showOctaveLines: false },
  });
  expect(screen.queryByText("Octave Line Color")).not.toBeInTheDocument();
});

test("toggle octave lines", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Octave Lines" }));
  expect(onChange).toHaveBeenCalledWith({ showOctaveLines: false });
});

test("toggle hit line", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Hit Line" }));
  expect(onChange).toHaveBeenCalledWith({ showHitLine: false });
});

test("toggle ripple, flash, rough edge and noise effects", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Ripple Effect" }));
  expect(onChange).toHaveBeenCalledWith({ showRippleEffect: false });
  await userEvent.click(screen.getByRole("switch", { name: "Note Flash Effect" }));
  expect(onChange).toHaveBeenCalledWith({ showNoteFlash: false });
  await userEvent.click(screen.getByRole("switch", { name: "Rough Edge" }));
  expect(onChange).toHaveBeenCalledWith({ showRoughEdge: true });
  await userEvent.click(screen.getByRole("switch", { name: "Noise Texture" }));
  expect(onChange).toHaveBeenCalledWith({ showNoiseTexture: true });
});

test("time window slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Time Window: ${verticalPianoRollConfig.timeWindow}s`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({ timeWindow: verticalPianoRollConfig.timeWindow + 0.1 });
});

test("keyboard height slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Keyboard Height: ${verticalPianoRollConfig.keyboardHeight}%`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    keyboardHeight: verticalPianoRollConfig.keyboardHeight + 1,
  });
});

test("note vertical margin slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Note Vertical Margin: ${verticalPianoRollConfig.noteVerticalMargin}px`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    noteVerticalMargin: verticalPianoRollConfig.noteVerticalMargin + 0.5,
  });
});

test("view range slider updates both bounds", async () => {
  await renderPane();
  const group = screen.getByRole("group", { name: /View Range/ });
  const [bottomSlider] = within(group).getAllByRole("slider", { hidden: true });
  bottomSlider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    viewRangeBottom: verticalPianoRollConfig.viewRangeBottom + 1,
    viewRangeTop: verticalPianoRollConfig.viewRangeTop,
  });
});

test("hit line fields are hidden when the hit line is off", async () => {
  await renderPane({
    config: { ...verticalPianoRollConfig, showHitLine: false },
  });
  expect(screen.queryByText("Hit Line Color")).not.toBeInTheDocument();
});

test("flash duration slider shown when flash mode is duration", async () => {
  await renderPane({
    config: {
      ...verticalPianoRollConfig,
      showNoteFlash: true,
      noteFlashMode: "duration",
    },
  });
  expect(
    screen.getByText(`Flash Duration: ${verticalPianoRollConfig.noteFlashDuration}sec`),
  ).toBeInTheDocument();
});

test.each([
  [/^Note Margin/, "noteMargin"],
  [/^Note Corner Radius/, "noteCornerRadius"],
  [/^Key Press Opacity/, "keyPressOpacity"],
  [/^Key Line Opacity/, "keyLineOpacity"],
  [/^Octave Line Opacity/, "octaveLineOpacity"],
  [/^Hit Line Width/, "hitLineWidth"],
  [/^Hit Line Opacity/, "hitLineOpacity"],
])("%s slider updates %s", async (label, key) => {
  await renderPane();
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test.each([
  ["White Key Color", "whiteKeyColor"],
  ["Black Key Color", "blackKeyColor"],
  ["Key Line Color", "keyLineColor"],
  ["Octave Line Color", "octaveLineColor"],
  ["Hit Line Color", "hitLineColor"],
])("%s picker updates %s", async (label, key) => {
  await renderPane();
  pickColor(label, "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ [key]: "#123456" });
});
