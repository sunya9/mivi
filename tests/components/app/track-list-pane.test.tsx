import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackListPane } from "@/components/app/track-list-pane";
import { expectedMidiTracks } from "tests/fixtures";
import { MidiTracks } from "@/lib/midi/midi";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";

const mockSetMidiTracks = vi.fn();
const mockOnChangeMidiFile = vi.fn();

beforeEach(() => {
  mockSetMidiTracks.mockClear();
  mockOnChangeMidiFile.mockClear();
});

function renderTrackListPane(
  props: Partial<ComponentProps<typeof TrackListPane>> = {},
) {
  return render(
    <TrackListPane
      setMidiTracks={mockSetMidiTracks}
      onChangeMidiFile={mockOnChangeMidiFile}
      {...props}
    />,
  );
}

test("should render MIDI file selection form when no tracks are provided", () => {
  renderTrackListPane();

  expect(screen.getByText("Open")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Choose MIDI file")).toBeInTheDocument();
});

test("should render track list when tracks are provided", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Acoustic Piano - Full")).toBeInTheDocument();
});

test("should render randomize color buttons when tracks are provided", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  expect(screen.getByText("Randomize colors (colorful)")).toBeInTheDocument();
  expect(screen.getByText("Randomize colors (gradient)")).toBeInTheDocument();
});

test("should call setMidiTracks with new colors when colorful button is clicked", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const button = screen.getByText("Randomize colors (colorful)");
  await userEvent.click(button);
  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should call setMidiTracks with new colors when gradient button is clicked", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const button = screen.getByText("Randomize colors (gradient)");
  await userEvent.click(button);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should update track config when TrackItem triggers update", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  // TrackItemのvisibilityスイッチをクリック
  const switchElement = screen.getByRole("switch");
  await userEvent.click(switchElement);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.visible).toBe(false);
});

test("should render MIDI offset input when tracks are provided", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  expect(screen.getByText("MIDI Offset (s)")).toBeInTheDocument();
  const offsetInput = screen.getByRole("spinbutton", {
    name: "MIDI Offset (s)",
  });
  expect(offsetInput).toBeInTheDocument();
  expect(offsetInput).toHaveValue(0);

  expect(screen.getByLabelText("Increase offset")).toBeInTheDocument();
  expect(screen.getByLabelText("Decrease offset")).toBeInTheDocument();
});

test("should increment MIDI offset when plus button is clicked", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const incrementButton = screen.getByLabelText("Increase offset");
  await userEvent.click(incrementButton);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[
    lastCallIndex
  ][0] as MidiTracks;
  expect(newMidiTracks.midiOffset).toBe(0.1);
});

test("should decrement MIDI offset when minus button is clicked", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const decrementButton = screen.getByLabelText("Decrease offset");
  await userEvent.click(decrementButton);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[
    lastCallIndex
  ][0] as MidiTracks;
  expect(newMidiTracks.midiOffset).toBe(-0.1);
});

test("should update MIDI offset when value is directly entered", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const offsetInput = screen.getByRole("spinbutton", {
    name: "MIDI Offset (s)",
  });
  fireEvent.change(offsetInput, { target: { value: "1.5" } });

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.midiOffset).toBe(1.5);
});

test("should allow negative MIDI offset values", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const offsetInput = screen.getByRole("spinbutton", {
    name: "MIDI Offset (s)",
  });
  fireEvent.change(offsetInput, { target: { value: "-0.5" } });

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.midiOffset).toBe(-0.5);
});

test("should reset MIDI offset to 0 when input is cleared and blurred", async () => {
  const midiTracksWithOffset: MidiTracks = {
    ...expectedMidiTracks,
    midiOffset: 1.5,
  };
  renderTrackListPane({ midiTracks: midiTracksWithOffset });

  const offsetInput = screen.getByRole("spinbutton", {
    name: "MIDI Offset (s)",
  });
  await userEvent.clear(offsetInput);
  offsetInput.blur();

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.midiOffset).toBe(0);
});

test("should not render MIDI offset input when no tracks are provided", () => {
  renderTrackListPane();

  expect(screen.queryByText("MIDI Offset (s)")).not.toBeInTheDocument();
});
