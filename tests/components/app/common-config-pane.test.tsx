import { expect, test, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { CommonConfigPane } from "@/components/app/common-config-pane";
import { RendererConfig } from "@/lib/renderers";
import { resolutions } from "@/lib/renderers";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";

const mockRendererConfig: RendererConfig = {
  type: "pianoRoll",
  backgroundColor: "#000000",
  resolution: {
    width: 1920,
    height: 1080,
    label: "1920×1080 (16:9)",
  },
  fps: 60,
  format: "mp4",
  pianoRollConfig: {
    noteHeight: 0,
    noteMargin: 0,
    noteVerticalMargin: 0,
    noteCornerRadius: 0,
    notePressDepth: 0,
    gridColor: "#000000",
    playheadColor: "#000000",
    playheadWidth: 0,
    playheadOpacity: 0,
    playheadPosition: 0,
    timeWindow: 0,
    viewRangeTop: 0,
    viewRangeBottom: 0,
    showPlayhead: false,
    showNotePressEffect: false,
    showNoteFlash: false,
    showRippleEffect: false,
    noteFlashDuration: 0,
    noteFlashIntensity: 0,
  },
};

const mockOnChangeMidiFile = vi.fn();
const mockOnChangeAudioFile = vi.fn();
const mockOnUpdateRendererConfig = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

const renderCommonConfigPane = (props = {}) => {
  return customRender(
    <CommonConfigPane
      rendererConfig={mockRendererConfig}
      onChangeMidiFile={mockOnChangeMidiFile}
      onChangeAudioFile={mockOnChangeAudioFile}
      onUpdateRendererConfig={mockOnUpdateRendererConfig}
      {...props}
    />,
  );
};

test("should render basic layout", () => {
  renderCommonConfigPane();
  expect(screen.getByText("MIDI / Audio Settings")).toBeInTheDocument();
  expect(screen.getByText("Common settings")).toBeInTheDocument();
  const footerParagraph = screen.getByText(/Created by/);
  expect(footerParagraph).toBeInTheDocument();

  expect(
    screen.getByRole("link", { name: "@ephemeralMocha" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Repository" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Switch Theme" }),
  ).toBeInTheDocument();
});

test("should call onChangeMidiFile when MIDI file is selected", () => {
  renderCommonConfigPane();
  const midiFileInput = screen.getByLabelText("Open MIDI file");
  const file = new File(["test"], "test.mid", { type: "audio/midi" });
  fireEvent.change(midiFileInput, { target: { files: [file] } });
  expect(mockOnChangeMidiFile).toHaveBeenCalledWith(file);
});

test("should call onChangeAudioFile when audio file is selected", () => {
  renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Open Audio file");
  const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
  fireEvent.change(audioFileInput, { target: { files: [file] } });
  expect(mockOnChangeAudioFile).toHaveBeenCalledWith(file);
});

test("not call onChangeMidiFile when file is not selected", () => {
  renderCommonConfigPane();
  const midiFileInput = screen.getByLabelText("Open MIDI file");
  fireEvent.change(midiFileInput, { target: { files: [] } });
  expect(mockOnChangeMidiFile).not.toHaveBeenCalled();
});

test("not call onChangeAudioFile when file is not selected", () => {
  renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Open Audio file");
  fireEvent.change(audioFileInput, { target: { files: [] } });
  expect(mockOnChangeAudioFile).not.toHaveBeenCalled();
});

test("should call onUpdateRendererConfig when background color is changed", () => {
  renderCommonConfigPane();
  const colorInput = screen.getByLabelText("Background Color");
  fireEvent.change(colorInput, { target: { value: "#ffffff" } });
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledWith({
    backgroundColor: "#ffffff",
  });
});

test("should call onUpdateRendererConfig when resolution is changed", async () => {
  renderCommonConfigPane();
  const resolutionTrigger = screen.getByRole("combobox", {
    name: "Resolution",
  });
  await userEvent.click(resolutionTrigger);
  const resolutionOption = screen.getByRole("option", {
    name: resolutions[1].label,
  });
  await userEvent.click(resolutionOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledWith({
    resolution: resolutions[1],
  });
});

test("should call onUpdateRendererConfig when FPS is changed", async () => {
  renderCommonConfigPane();
  const fpsTrigger = screen.getByRole("combobox", { name: "FPS" });
  await userEvent.click(fpsTrigger);
  const fpsOption = screen.getByRole("option", { name: "30 fps" });
  await userEvent.click(fpsOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledWith({ fps: 30 });
});

test("should call onUpdateRendererConfig when format is changed", async () => {
  renderCommonConfigPane();
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await userEvent.click(formatTrigger);
  const formatOption = screen.getByRole("option", { name: "WebM (VP9)" });
  await userEvent.click(formatOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledWith({ format: "webm" });
});

test("should clear file input after selection", () => {
  renderCommonConfigPane();

  const midiFileInput: HTMLInputElement =
    screen.getByLabelText("Open MIDI file");
  const file = new File(["test"], "test.mid", { type: "audio/midi" });

  fireEvent.change(midiFileInput, { target: { files: [file] } });
  expect(midiFileInput.value).toBe("");
});

test("should clear selected file when cancel button is clicked", async () => {
  renderCommonConfigPane({ midiFilename: "test.mid" });

  const cancelButton = screen.getByRole("button", { name: "Cancel" });
  await userEvent.click(cancelButton);
  expect(mockOnChangeMidiFile).toHaveBeenCalledWith(undefined);
});
