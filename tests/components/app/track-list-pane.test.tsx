import { expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackListPane } from "@/components/app/track-list-pane";
import { expectedMidiTracks } from "tests/fixtures";
import { MidiTracks } from "@/lib/midi/midi";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";

const mockSetMidiTracks = vi.fn();
const mockOnChangeMidiFile = vi.fn();

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

test("should render color presets dropdown when tracks are provided", () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  expect(screen.getByText("Color presets")).toBeInTheDocument();
});

test("should call setMidiTracks with all white colors when All white is selected", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const dropdownButton = screen.getByText("Color presets");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("All white");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks.every((t) => t.config.color === "#ffffff")).toBe(
    true,
  );
});

test("should call setMidiTracks with all black colors when All black is selected", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const dropdownButton = screen.getByText("Color presets");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("All black");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks.every((t) => t.config.color === "#000000")).toBe(
    true,
  );
});

test("should call setMidiTracks with new colors when Randomize (colorful) is selected", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const dropdownButton = screen.getByText("Color presets");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("Randomize (colorful)");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should call setMidiTracks with new colors when Randomize (gradient) is selected", async () => {
  renderTrackListPane({ midiTracks: expectedMidiTracks });

  const dropdownButton = screen.getByText("Color presets");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("Randomize (gradient)");
  await userEvent.click(menuItem);

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

test("should render drag handles for each track", () => {
  const multiTrackMidi: MidiTracks = {
    ...expectedMidiTracks,
    tracks: [
      {
        ...expectedMidiTracks.tracks[0],
        id: "track-1",
        config: { ...expectedMidiTracks.tracks[0].config, name: "Track 1" },
      },
      {
        ...expectedMidiTracks.tracks[0],
        id: "track-2",
        config: { ...expectedMidiTracks.tracks[0].config, name: "Track 2" },
      },
      {
        ...expectedMidiTracks.tracks[0],
        id: "track-3",
        config: { ...expectedMidiTracks.tracks[0].config, name: "Track 3" },
      },
    ],
  };

  renderTrackListPane({ midiTracks: multiTrackMidi });

  const dragHandles = screen.getAllByRole("button", {
    name: "Drag to reorder",
  });
  expect(dragHandles).toHaveLength(3);
});

test("should render tracks in correct order", () => {
  const multiTrackMidi: MidiTracks = {
    ...expectedMidiTracks,
    tracks: [
      {
        ...expectedMidiTracks.tracks[0],
        id: "track-1",
        config: { ...expectedMidiTracks.tracks[0].config, name: "First Track" },
      },
      {
        ...expectedMidiTracks.tracks[0],
        id: "track-2",
        config: {
          ...expectedMidiTracks.tracks[0].config,
          name: "Second Track",
        },
      },
    ],
  };

  renderTrackListPane({ midiTracks: multiTrackMidi });

  const trackNames = screen.getAllByText(/Track$/);
  expect(trackNames[0]).toHaveTextContent("First Track");
  expect(trackNames[1]).toHaveTextContent("Second Track");
});
