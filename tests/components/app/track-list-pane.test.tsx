import { expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackListPane } from "@/components/app/track-list-pane";
import { expectedMidiTracks } from "tests/fixtures";
import { MidiTracks } from "@/lib/midi/midi";
import userEvent from "@testing-library/user-event";

const mockSetMidiTracks = vi.fn();

beforeEach(() => {
  mockSetMidiTracks.mockClear();
});

test("should render 'Select a MIDI file' message when no tracks are provided", () => {
  render(<TrackListPane setMidiTracks={mockSetMidiTracks} />);

  expect(screen.getByText("Select a MIDI file")).toBeInTheDocument();
});

test("should render track list when tracks are provided", () => {
  render(
    <TrackListPane
      midiTracks={expectedMidiTracks}
      setMidiTracks={mockSetMidiTracks}
    />,
  );

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Acoustic Piano - Full")).toBeInTheDocument();
});

test("should render randomize color buttons when tracks are provided", () => {
  render(
    <TrackListPane
      midiTracks={expectedMidiTracks}
      setMidiTracks={mockSetMidiTracks}
    />,
  );

  expect(screen.getByText("Randomize colors (colorful)")).toBeInTheDocument();
  expect(screen.getByText("Randomize colors (gradient)")).toBeInTheDocument();
});

test("should call setMidiTracks with new colors when colorful button is clicked", async () => {
  render(
    <TrackListPane
      midiTracks={expectedMidiTracks}
      setMidiTracks={mockSetMidiTracks}
    />,
  );

  const button = screen.getByText("Randomize colors (colorful)");
  await userEvent.click(button);
  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should call setMidiTracks with new colors when gradient button is clicked", async () => {
  render(
    <TrackListPane
      midiTracks={expectedMidiTracks}
      setMidiTracks={mockSetMidiTracks}
    />,
  );

  const button = screen.getByText("Randomize colors (gradient)");
  await userEvent.click(button);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const newMidiTracks = mockSetMidiTracks.mock.calls[0][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.color).toMatch(/#[0-9a-f]{6}/i);
});

test("should update track config when TrackItem triggers update", async () => {
  render(
    <TrackListPane
      midiTracks={expectedMidiTracks}
      setMidiTracks={mockSetMidiTracks}
    />,
  );

  // TrackItemのvisibilityスイッチをクリック
  const switchElement = screen.getByRole("switch");
  await userEvent.click(switchElement);

  expect(mockSetMidiTracks).toHaveBeenCalled();
  const lastCall = mockSetMidiTracks.mock.calls.length - 1;
  const newMidiTracks = mockSetMidiTracks.mock.calls[lastCall][0] as MidiTracks;
  expect(newMidiTracks.tracks[0].config.visible).toBe(false);
});
