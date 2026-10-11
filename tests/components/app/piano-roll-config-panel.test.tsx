import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { chooseAnotherOption, customRender, nudgeSlider, pickColor } from "tests/util";
import { expect, test, vi } from "vitest";

import { PianoRollConfigPanel } from "@/components/app/piano-roll-config-panel";

type Props = ComponentProps<typeof PianoRollConfigPanel>;
const onChange: Props["onChange"] = vi.fn<Props["onChange"]>();
const pianoRollConfig = rendererConfig.pianoRollConfig;

async function renderPane(overrideProps?: Partial<Props>) {
  await customRender(
    <PianoRollConfigPanel
      onChange={onChange}
      config={pianoRollConfig}
      minNote={testMidiTracks.minNote}
      maxNote={testMidiTracks.maxNote}
      {...overrideProps}
    />,
  );
}

// Render tests
test("renders time window label", async () => {
  await renderPane();
  expect(screen.getByText(`Time Window: ${pianoRollConfig.timeWindow}s`)).toBeInTheDocument();
});

test("renders note height label", async () => {
  await renderPane();
  expect(screen.getByText(`Note Height: ${pianoRollConfig.noteHeight}px`)).toBeInTheDocument();
});

test("renders playhead position label", async () => {
  await renderPane();
  expect(
    screen.getByText(`Playhead Position: ${pianoRollConfig.playheadPosition}%`),
  ).toBeInTheDocument();
});

test("displays detected note range when midiTracks provided", async () => {
  await renderPane();
  expect(screen.getByText(/Detected range: 60 - 72/, { exact: false })).toBeInTheDocument();
});

test("does not display detected note range when no midiTracks", async () => {
  await renderPane({ minNote: undefined, maxNote: undefined });
  expect(screen.queryByText(/Detected range/)).not.toBeInTheDocument();
});

// Switch toggle tests
test("toggle playhead border", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Playhead Border" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ showPlayhead: false });
});

test("toggle ripple effect", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Ripple Effect" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ showRippleEffect: !pianoRollConfig.showRippleEffect });
});

test("toggle note press effect", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Note Press Effect" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({
    showNotePressEffect: !pianoRollConfig.showNotePressEffect,
  });
});

test("toggle note flash effect", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Note Flash Effect" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ showNoteFlash: !pianoRollConfig.showNoteFlash });
});

test("toggle rough edge", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Rough Edge" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ showRoughEdge: !pianoRollConfig.showRoughEdge });
});

test("toggle noise texture", async () => {
  await renderPane();
  const switchEl = screen.getByRole("switch", { name: "Noise Texture" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ showNoiseTexture: !pianoRollConfig.showNoiseTexture });
});

// Slider value change tests
test("time window slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Time Window: ${pianoRollConfig.timeWindow}s`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({ timeWindow: pianoRollConfig.timeWindow + 0.1 });
});

test("note height slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Note Height: ${pianoRollConfig.noteHeight}px`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({ noteHeight: pianoRollConfig.noteHeight + 1 });
});

test("note corner radius slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Note Corner Radius: ${pianoRollConfig.noteCornerRadius}px`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    noteCornerRadius: pianoRollConfig.noteCornerRadius + 0.5,
  });
});

test("note margin slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Note Margin: ${pianoRollConfig.noteMargin}px`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({ noteMargin: pianoRollConfig.noteMargin + 0.5 });
});

test("playhead position slider updates value", async () => {
  await renderPane();
  const group = screen.getByRole("group", {
    name: `Playhead Position: ${pianoRollConfig.playheadPosition}%`,
  });
  const slider = within(group).getByRole("slider", { hidden: true });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenCalledWith({
    playheadPosition: pianoRollConfig.playheadPosition + 1,
  });
});

// Conditional fields tests
test("playhead border fields shown when showPlayhead is true", async () => {
  await renderPane({
    config: { ...pianoRollConfig, showPlayhead: true },
  });
  expect(screen.getByText("Playhead Border Color")).toBeInTheDocument();
  expect(
    screen.getByText(`Playhead Border Width: ${pianoRollConfig.playheadWidth}px`),
  ).toBeInTheDocument();
});

test("ripple fields shown when showRippleEffect is true", async () => {
  await renderPane({
    config: { ...pianoRollConfig, showRippleEffect: true },
  });
  expect(screen.getByRole("switch", { name: "Use Custom Ripple Color" })).toBeInTheDocument();
  expect(
    screen.getByText(`Ripple Duration: ${pianoRollConfig.rippleDuration}sec`),
  ).toBeInTheDocument();
});

test("flash mode select is rendered with current value", async () => {
  await renderPane({
    config: { ...pianoRollConfig, showNoteFlash: true },
  });
  const trigger = screen.getByRole("combobox", { name: "Flash Mode" });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveTextContent(pianoRollConfig.noteFlashMode === "on" ? "On" : "Duration▼");
});

test("flash mode select only references label ids that exist", async () => {
  await renderPane({
    config: { ...pianoRollConfig, showNoteFlash: true },
  });
  const trigger = screen.getByRole("combobox", { name: "Flash Mode" });
  for (const id of trigger.getAttribute("aria-labelledby")?.split(" ") ?? []) {
    expect(document.getElementById(id)).not.toBeNull();
  }
});

test("flash duration slider shown when flash mode is duration", async () => {
  await renderPane({
    config: {
      ...pianoRollConfig,
      showNoteFlash: true,
      noteFlashMode: "duration",
    },
  });
  expect(
    screen.getByText(`Flash Duration: ${pianoRollConfig.noteFlashDuration}sec`),
  ).toBeInTheDocument();
});

const everySectionOn = {
  ...pianoRollConfig,
  showPlayhead: true,
  showNotePressEffect: true,
  showRippleEffect: true,
  useCustomRippleColor: true,
  showNoteFlash: true,
  noteFlashMode: "duration" as const,
  showRoughEdge: true,
  showNoiseTexture: true,
};

test.each([
  [/^Note Vertical Margin/, "noteVerticalMargin"],
  [/^Playhead Border Width/, "playheadWidth"],
  [/^Playhead Border Opacity/, "playheadOpacity"],
  [/^View Range/, "viewRangeBottom"],
  [/^Press Depth/, "notePressDepth"],
  [/^Press Animation Duration/, "pressAnimationDuration"],
  [/^Ripple Duration/, "rippleDuration"],
  [/^Ripple Radius/, "rippleRadius"],
  [/^Flash Intensity/, "noteFlashIntensity"],
  [/^Fade Out Duration/, "noteFlashFadeOutDuration"],
  [/^Flash Duration/, "noteFlashDuration"],
  [/^Rough Edge Intensity/, "roughEdgeIntensity"],
  [/^Rough Edge Segment/, "roughEdgeSegmentLength"],
  [/^Noise Intensity/, "noiseIntensity"],
  [/^Noise Grain Size/, "noiseGrainSize"],
  [/^Noise Color Variance/, "noiseColorVariance"],
])("%s slider updates %s", async (label, key) => {
  await renderPane({ config: everySectionOn });
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test.each([
  ["Playhead Border Color", "playheadColor"],
  ["Ripple Color", "rippleColor"],
])("%s picker updates %s", async (label, key) => {
  await renderPane({ config: everySectionOn });
  pickColor(label, "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ [key]: "#123456" });
});

test("use custom ripple color switch updates useCustomRippleColor", async () => {
  await renderPane({ config: everySectionOn });
  await userEvent.click(screen.getByRole("switch", { name: "Use Custom Ripple Color" }));
  expect(onChange).toHaveBeenLastCalledWith({ useCustomRippleColor: false });
});

test("flash mode select updates noteFlashMode", async () => {
  await renderPane({ config: everySectionOn });
  await chooseAnotherOption("Flash Mode");
  expect(onChange).toHaveBeenLastCalledWith({ noteFlashMode: "on" });
});
