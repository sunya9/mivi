import { expect, vi, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackItem } from "@/components/TrackItem";
import { MidiTrack } from "@/types/midi";
import { expectedMidiTracks } from "tests/fixtures";
import userEvent from "@testing-library/user-event";

const mockTrack: MidiTrack = expectedMidiTracks.tracks[0];

const mockOnUpdateTrackConfig = vi.fn();

test("should render track name and visibility switch", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Acoustic Piano - Full")).toBeInTheDocument();
  expect(screen.getByRole("switch")).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when visibility is toggled", async () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const switchElement = screen.getByRole("switch");
  await userEvent.click(switchElement);

  expect(mockOnUpdateTrackConfig).toHaveBeenCalledWith(0, { visible: false });
});

test("should render opacity slider when track is visible", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Opacity: 100%")).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Opacity" })).toBeInTheDocument();
});

test.todo("should call onUpdateTrackConfig when opacity is changed", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const slider = screen.getByRole("slider");
  fireEvent.change(slider, { target: { value: 0.5 } });

  expect(mockOnUpdateTrackConfig).toHaveBeenCalledWith(0, { opacity: 0.5 });
});

test("should render color picker when track is visible", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByDisplayValue("#000000")).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when color is changed", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const colorPicker = screen.getByDisplayValue("#000000");
  fireEvent.change(colorPicker, { target: { value: "#00ff00" } });

  expect(mockOnUpdateTrackConfig).toHaveBeenCalledWith(0, {
    color: "#00ff00",
  });
});

test("should render staccato checkbox when track is visible", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Staccato")).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when staccato is toggled", async () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const checkbox = screen.getByRole("checkbox");
  await userEvent.click(checkbox);

  expect(mockOnUpdateTrackConfig).toHaveBeenCalledWith(0, { staccato: true });
});

test("should render scale slider when track is visible", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Scale: 100%")).toBeInTheDocument();
  expect(screen.getAllByRole("slider")[1]).toBeInTheDocument();
});

test.todo("should call onUpdateTrackConfig when scale is changed", () => {
  render(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const slider = screen.getAllByRole("slider")[1];
  fireEvent.change(slider, { target: { value: 0.75 } });

  expect(mockOnUpdateTrackConfig).toHaveBeenCalledWith(0, { scale: 0.75 });
});

test("should not render controls when track is not visible", () => {
  const invisibleTrack: MidiTrack = {
    ...mockTrack,
    config: {
      ...mockTrack.config,
      visible: false,
    },
  };

  render(
    <TrackItem
      track={invisibleTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.queryByText("Opacity: 100%")).not.toBeInTheDocument();
  expect(screen.queryByRole("color")).not.toBeInTheDocument();
  expect(screen.queryByText("Staccato")).not.toBeInTheDocument();
  expect(screen.queryByText("Scale: 100%")).not.toBeInTheDocument();
});
