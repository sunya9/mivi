import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
