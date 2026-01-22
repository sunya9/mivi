import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { PianoRollConfigPanel } from "@/lib/renderers/piano-roll/piano-roll-config-panel";
import { customRender } from "tests/util";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";

type Props = ComponentProps<typeof PianoRollConfigPanel>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] = vi.fn();
const pianoRollConfig = rendererConfig.pianoRollConfig;

function renderPane(overrideProps?: Partial<Props>) {
  customRender(
    <PianoRollConfigPanel
      onUpdateRendererConfig={onUpdateRendererConfig}
      pianoRollConfig={pianoRollConfig}
      minNote={testMidiTracks.minNote}
      maxNote={testMidiTracks.maxNote}
      {...overrideProps}
    />,
  );
}

// Render tests
test("renders time window label", () => {
  renderPane();
  expect(
    screen.getByText(`Time Window: ${pianoRollConfig.timeWindow}s`),
  ).toBeInTheDocument();
});

test("renders note height label", () => {
  renderPane();
  expect(
    screen.getByText(`Note Height: ${pianoRollConfig.noteHeight}px`),
  ).toBeInTheDocument();
});

test("renders playhead position label", () => {
  renderPane();
  expect(
    screen.getByText(`Playhead Position: ${pianoRollConfig.playheadPosition}%`),
  ).toBeInTheDocument();
});

test("displays detected note range when midiTracks provided", () => {
  renderPane();
  expect(
    screen.getByText(/Detected range: 60 - 72/, { exact: false }),
  ).toBeInTheDocument();
});

test("does not display detected note range when no midiTracks", () => {
  renderPane({ minNote: undefined, maxNote: undefined });
  expect(screen.queryByText(/Detected range/)).not.toBeInTheDocument();
});

// Switch toggle tests
test("toggle playhead border", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Playhead Border" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { showPlayhead: false },
  });
});

test("toggle ripple effect", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Ripple Effect" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { showRippleEffect: !pianoRollConfig.showRippleEffect },
  });
});

test("toggle note press effect", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Note Press Effect" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: {
      showNotePressEffect: !pianoRollConfig.showNotePressEffect,
    },
  });
});

test("toggle note flash effect", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Note Flash Effect" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { showNoteFlash: !pianoRollConfig.showNoteFlash },
  });
});

test("toggle rough edge", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Rough Edge" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { showRoughEdge: !pianoRollConfig.showRoughEdge },
  });
});

test("toggle noise texture", async () => {
  renderPane();
  const switchEl = screen.getByRole("switch", { name: "Noise Texture" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { showNoiseTexture: !pianoRollConfig.showNoiseTexture },
  });
});

// Slider value change tests
test("time window slider updates value", async () => {
  renderPane();
  const slider = screen.getByRole("slider", {
    name: `Time Window: ${pianoRollConfig.timeWindow}s`,
  });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { timeWindow: pianoRollConfig.timeWindow + 0.1 },
  });
});

test("note height slider updates value", async () => {
  renderPane();
  const slider = screen.getByRole("slider", {
    name: `Note Height: ${pianoRollConfig.noteHeight}px`,
  });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { noteHeight: pianoRollConfig.noteHeight + 1 },
  });
});

test("note corner radius slider updates value", async () => {
  renderPane();
  const slider = screen.getByRole("slider", {
    name: `Note Corner Radius: ${pianoRollConfig.noteCornerRadius}px`,
  });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: {
      noteCornerRadius: pianoRollConfig.noteCornerRadius + 0.5,
    },
  });
});

test("note margin slider updates value", async () => {
  renderPane();
  const slider = screen.getByRole("slider", {
    name: `Note Margin: ${pianoRollConfig.noteMargin}px`,
  });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: { noteMargin: pianoRollConfig.noteMargin + 0.5 },
  });
});

test("playhead position slider updates value", async () => {
  renderPane();
  const slider = screen.getByRole("slider", {
    name: `Playhead Position: ${pianoRollConfig.playheadPosition}%`,
  });
  slider.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    pianoRollConfig: {
      playheadPosition: pianoRollConfig.playheadPosition + 1,
    },
  });
});

// Conditional fields tests
test("playhead border fields shown when showPlayhead is true", () => {
  renderPane({
    pianoRollConfig: { ...pianoRollConfig, showPlayhead: true },
  });
  expect(screen.getByText("Playhead Border Color")).toBeInTheDocument();
  expect(
    screen.getByText(
      `Playhead Border Width: ${pianoRollConfig.playheadWidth}px`,
    ),
  ).toBeInTheDocument();
});

test("ripple fields shown when showRippleEffect is true", () => {
  renderPane({
    pianoRollConfig: { ...pianoRollConfig, showRippleEffect: true },
  });
  expect(
    screen.getByRole("switch", { name: "Use Custom Ripple Color" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(`Ripple Duration: ${pianoRollConfig.rippleDuration}sec`),
  ).toBeInTheDocument();
});

test("flash mode select is rendered with current value", () => {
  renderPane({
    pianoRollConfig: { ...pianoRollConfig, showNoteFlash: true },
  });
  const trigger = screen.getByRole("combobox", { name: "Flash Mode" });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveTextContent(
    pianoRollConfig.noteFlashMode === "on" ? "On" : "Duration",
  );
});

test("flash duration slider shown when flash mode is duration", () => {
  renderPane({
    pianoRollConfig: {
      ...pianoRollConfig,
      showNoteFlash: true,
      noteFlashMode: "duration",
    },
  });
  expect(
    screen.getByText(`Flash Duration: ${pianoRollConfig.noteFlashDuration}sec`),
  ).toBeInTheDocument();
});
