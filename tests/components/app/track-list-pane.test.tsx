import { expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackListPane } from "@/components/app/track-list-pane";
import { testMidiTracks } from "tests/fixtures";
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
  renderTrackListPane({ midiTracks: testMidiTracks });

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Acoustic Piano - Full")).toBeInTheDocument();
});

test("should render color preset menu when tracks are provided", () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  expect(screen.getByText("Color preset")).toBeInTheDocument();
});

test("should call setMidiTracks with all white colors when All white is selected", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
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
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
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
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("Randomize (colorful)");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should call setMidiTracks with new colors when Randomize (gradient) is selected", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);
  const menuItem = screen.getByText("Randomize (gradient)");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should update track config when TrackItem triggers update", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  // TrackItemのvisibilityスイッチをクリック
  const switchElement = screen.getByRole("switch");
  await userEvent.click(switchElement);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.visible).toBe(false);
});

test("should render MIDI offset input when tracks are provided", () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

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
  renderTrackListPane({ midiTracks: testMidiTracks });

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
  renderTrackListPane({ midiTracks: testMidiTracks });

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
  renderTrackListPane({ midiTracks: testMidiTracks });

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
  renderTrackListPane({ midiTracks: testMidiTracks });

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
    ...testMidiTracks,
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
    ...testMidiTracks,
    tracks: [
      {
        ...testMidiTracks.tracks[0],
        id: "track-1",
        config: { ...testMidiTracks.tracks[0].config, name: "Track 1" },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-2",
        config: { ...testMidiTracks.tracks[0].config, name: "Track 2" },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-3",
        config: { ...testMidiTracks.tracks[0].config, name: "Track 3" },
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
    ...testMidiTracks,
    tracks: [
      {
        ...testMidiTracks.tracks[0],
        id: "track-1",
        config: { ...testMidiTracks.tracks[0].config, name: "First Track" },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-2",
        config: {
          ...testMidiTracks.tracks[0].config,
          name: "Second Track",
        },
      },
    ],
  };

  renderTrackListPane({ midiTracks: multiTrackMidi });

  const trackNames = screen.getAllByText(/(First|Second) Track$/);
  expect(trackNames[0]).toHaveTextContent("First Track");
  expect(trackNames[1]).toHaveTextContent("Second Track");
});

test("should show Randomize (Hue)... option in color presets dropdown", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);

  expect(screen.getByText("Randomize (Hue)...")).toBeInTheDocument();
});

test("should open HueRandomizeDialog when Randomize (Hue)... is selected", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);
  await userEvent.click(screen.getByText("Randomize (Hue)..."));

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Randomize Hue")).toBeInTheDocument();
});

test("should call setMidiTracks with hue-randomized colors when Apply is clicked in HueRandomizeDialog", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  localStorage.setItem(
    "mivi:hue-randomize-sl",
    JSON.stringify({ s: 100, l: 50 }),
  );
  // h = 0, s = 100, l = 50 -> #ff0000
  renderTrackListPane({ midiTracks: testMidiTracks });

  // Open dialog
  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);
  await userEvent.click(screen.getByText("Randomize (Hue)..."));

  // Click Apply button
  await userEvent.click(screen.getByRole("button", { name: /apply/i }));

  // setMidiTracks is called with a function (functional setState pattern)
  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const setStateArg = mockSetMidiTracks.mock.calls[lastCallIndex][0] as (
    prev: MidiTracks,
  ) => MidiTracks;

  // Call the function with current midiTracks to get the result
  const newMidiTracks = setStateArg(testMidiTracks);

  // Verify all tracks have valid hex colors
  expect(newMidiTracks.tracks.length).toBe(testMidiTracks.tracks.length);
  for (const track of newMidiTracks.tracks) {
    expect(track.config.color).toBe("#ff0000");
  }
});

test("should reset dialog values when cancelled and reopened", async () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  // Open dialog
  const dropdownButton = screen.getByText("Color preset");
  await userEvent.click(dropdownButton);
  await userEvent.click(screen.getByText("Randomize (Hue)..."));

  // Default values should be 100% saturation and 50% lightness
  expect(screen.getByText("100%")).toBeInTheDocument();
  expect(screen.getByText("50%")).toBeInTheDocument();

  // Change values by clicking dark preset (s=80, l=30)
  await userEvent.click(screen.getByRole("button", { name: /dark/i }));
  expect(screen.getByText("80%")).toBeInTheDocument();
  expect(screen.getByText("30%")).toBeInTheDocument();

  // Cancel the dialog
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  // Dialog should be closed
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  // Reopen dialog
  await userEvent.click(dropdownButton);
  await userEvent.click(screen.getByText("Randomize (Hue)..."));

  // Values should be reset to defaults (100% and 50%)
  expect(screen.getByText("100%")).toBeInTheDocument();
  expect(screen.getByText("50%")).toBeInTheDocument();
});

test("should render Track menu when tracks are provided", () => {
  renderTrackListPane({ midiTracks: testMidiTracks });

  expect(screen.getByText("Track")).toBeInTheDocument();
});

test("should call setMidiTracks with all tracks disabled when Disable all is selected", async () => {
  const multiTrackMidi: MidiTracks = {
    ...testMidiTracks,
    tracks: [
      {
        ...testMidiTracks.tracks[0],
        id: "track-1",
        config: { ...testMidiTracks.tracks[0].config, visible: true },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-2",
        config: { ...testMidiTracks.tracks[0].config, visible: true },
      },
    ],
  };
  renderTrackListPane({ midiTracks: multiTrackMidi });

  const trackMenuButton = screen.getByText("Track");
  await userEvent.click(trackMenuButton);
  const menuItem = screen.getByText("Disable all");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[
    lastCallIndex
  ][0] as MidiTracks;
  expect(newMidiTracks.tracks.every((t) => t.config.visible === false)).toBe(
    true,
  );
});

test("should call setMidiTracks with all tracks enabled when Enable all is selected", async () => {
  const multiTrackMidi: MidiTracks = {
    ...testMidiTracks,
    tracks: [
      {
        ...testMidiTracks.tracks[0],
        id: "track-1",
        config: { ...testMidiTracks.tracks[0].config, visible: false },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-2",
        config: { ...testMidiTracks.tracks[0].config, visible: false },
      },
    ],
  };
  renderTrackListPane({ midiTracks: multiTrackMidi });

  const trackMenuButton = screen.getByText("Track");
  await userEvent.click(trackMenuButton);
  const menuItem = screen.getByText("Enable all");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[
    lastCallIndex
  ][0] as MidiTracks;
  expect(newMidiTracks.tracks.every((t) => t.config.visible === true)).toBe(
    true,
  );
});

test("should sort disabled tracks to bottom when Sort disabled to bottom is selected", async () => {
  const multiTrackMidi: MidiTracks = {
    ...testMidiTracks,
    tracks: [
      {
        ...testMidiTracks.tracks[0],
        id: "track-1",
        config: {
          ...testMidiTracks.tracks[0].config,
          name: "Disabled Track",
          visible: false,
        },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-2",
        config: {
          ...testMidiTracks.tracks[0].config,
          name: "Enabled Track",
          visible: true,
        },
      },
      {
        ...testMidiTracks.tracks[0],
        id: "track-3",
        config: {
          ...testMidiTracks.tracks[0].config,
          name: "Another Disabled",
          visible: false,
        },
      },
    ],
  };
  renderTrackListPane({ midiTracks: multiTrackMidi });

  const trackMenuButton = screen.getByText("Track");
  await userEvent.click(trackMenuButton);
  const menuItem = screen.getByText("Sort disabled to bottom");
  await userEvent.click(menuItem);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCallIndex = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[
    lastCallIndex
  ][0] as MidiTracks;

  // Enabled tracks should come first, disabled tracks at the end
  expect(newMidiTracks.tracks[0].config.visible).toBe(true);
  expect(newMidiTracks.tracks[0].config.name).toBe("Enabled Track");
  expect(newMidiTracks.tracks[1].config.visible).toBe(false);
  expect(newMidiTracks.tracks[2].config.visible).toBe(false);
});
