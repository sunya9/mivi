import { screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { PianoRollConfigPanel } from "@/lib/renderers/piano-roll/piano-roll-config-panel";
import { customRender } from "tests/util";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
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
      minNote={expectedMidiTracks.minNote}
      maxNote={expectedMidiTracks.maxNote}
      {...overrideProps}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PianoRollConfigPanel", () => {
  test("should render PianoRoll component", async () => {
    renderPane();
    const switchPlayheadBorder = screen.getByRole("switch", {
      name: "Show Playhead Border",
    });
    expect(switchPlayheadBorder).toBeInTheDocument();
    await userEvent.click(switchPlayheadBorder);
    expect(onUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
      pianoRollConfig: {
        showPlayhead: false,
      },
    });
  });

  test("should toggle ripple effect", async () => {
    renderPane();
    const switchRipple = screen.getByRole("switch", {
      name: "Show Ripple Effect",
    });
    expect(switchRipple).toBeInTheDocument();
    await userEvent.click(switchRipple);
    expect(onUpdateRendererConfig).toHaveBeenCalledWith({
      pianoRollConfig: {
        showRippleEffect: !pianoRollConfig.showRippleEffect,
      },
    });
  });

  test("should toggle note press effect", async () => {
    renderPane();
    const switchPress = screen.getByRole("switch", {
      name: "Note Press Effect",
    });
    expect(switchPress).toBeInTheDocument();
    await userEvent.click(switchPress);
    expect(onUpdateRendererConfig).toHaveBeenCalledWith({
      pianoRollConfig: {
        showNotePressEffect: !pianoRollConfig.showNotePressEffect,
      },
    });
  });

  test("should toggle note flash effect", async () => {
    renderPane();
    const switchFlash = screen.getByRole("switch", {
      name: "Note Flash Effect",
    });
    expect(switchFlash).toBeInTheDocument();
    await userEvent.click(switchFlash);
    expect(onUpdateRendererConfig).toHaveBeenCalledWith({
      pianoRollConfig: {
        showNoteFlash: !pianoRollConfig.showNoteFlash,
      },
    });
  });

  test("should display detected note range when midiTracks provided", () => {
    renderPane();
    expect(
      screen.getByText(/Detected range: 60 - 72/, { exact: false }),
    ).toBeInTheDocument();
  });

  test("should not display detected note range when no midiTracks", () => {
    renderPane({ minNote: undefined, maxNote: undefined });
    expect(screen.queryByText(/Detected range/)).not.toBeInTheDocument();
  });

  test("should render time window label", () => {
    renderPane();
    expect(
      screen.getByText(`Time Window: ${pianoRollConfig.timeWindow}s`),
    ).toBeInTheDocument();
  });

  test("should render note height label", () => {
    renderPane();
    expect(
      screen.getByText(`Note Height: ${pianoRollConfig.noteHeight}px`),
    ).toBeInTheDocument();
  });

  test("should render playhead position label", () => {
    renderPane();
    expect(
      screen.getByText(
        `Playhead Position: ${pianoRollConfig.playheadPosition}%`,
      ),
    ).toBeInTheDocument();
  });
});
