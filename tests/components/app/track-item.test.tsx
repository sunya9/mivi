import { expect, vi, test, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackItem } from "@/components/app/track-item";
import { MidiTrack } from "@/lib/midi/midi";
import { expectedMidiTracks } from "tests/fixtures";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

const mockTrack: MidiTrack = expectedMidiTracks.tracks[0];

const mockOnUpdateTrackConfig = vi.fn();

// Wrapper component for dnd-kit context
function renderWithDndContext(
  ui: React.ReactElement,
  trackId: string = mockTrack.id,
) {
  return render(
    <DndContext>
      <SortableContext items={[trackId]}>{ui}</SortableContext>
    </DndContext>,
  );
}

beforeEach(() => {
  mockOnUpdateTrackConfig.mockClear();
});

test("should render track name and visibility switch", () => {
  renderWithDndContext(
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
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const switchElement = screen.getByRole("switch");
  await userEvent.click(switchElement);

  expect(mockOnUpdateTrackConfig).toHaveBeenLastCalledWith(0, {
    visible: false,
  });
});

test("should render opacity slider when track is visible", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Opacity: 100%")).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Opacity" })).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when opacity is changed", async () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const slider = screen.getByRole("slider", { name: "Opacity" });
  await userEvent.click(slider);
  await userEvent.keyboard("{arrowleft}");

  expect(mockOnUpdateTrackConfig).toHaveBeenLastCalledWith(0, {
    opacity: 0.95,
  });
});

test("should render color picker when track is visible", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByDisplayValue("#ffffff")).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when color is changed", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const colorPicker = screen.getByDisplayValue("#ffffff");
  fireEvent.change(colorPicker, { target: { value: "#00ff00" } });

  expect(mockOnUpdateTrackConfig).toHaveBeenLastCalledWith(0, {
    color: "#00ff00",
  });
});

test("should render staccato checkbox when track is visible", () => {
  renderWithDndContext(
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
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const checkbox = screen.getByRole("checkbox");
  await userEvent.click(checkbox);

  expect(mockOnUpdateTrackConfig).toHaveBeenLastCalledWith(0, {
    staccato: true,
  });
});

test("should render scale slider when track is visible", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  expect(screen.getByText("Scale: 100%")).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Scale" })).toBeInTheDocument();
});

test("should call onUpdateTrackConfig when scale is changed", async () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const slider = screen.getByRole("slider", { name: "Scale" });
  await userEvent.click(slider);
  await userEvent.keyboard("{arrowleft}");

  expect(mockOnUpdateTrackConfig).toHaveBeenLastCalledWith(0, {
    scale: 0.95,
  });
});

test("should not render controls when track is not visible", () => {
  const invisibleTrack: MidiTrack = {
    ...mockTrack,
    config: {
      ...mockTrack.config,
      visible: false,
    },
  };

  renderWithDndContext(
    <TrackItem
      track={invisibleTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
    invisibleTrack.id,
  );

  expect(screen.queryByText("Opacity: 100%")).not.toBeInTheDocument();
  expect(screen.queryByRole("color")).not.toBeInTheDocument();
  expect(screen.queryByText("Staccato")).not.toBeInTheDocument();
  expect(screen.queryByText("Scale: 100%")).not.toBeInTheDocument();
  expect(screen.getByRole("switch")).toBeVisible();
});

test("should render drag handle button", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const dragHandle = screen.getByRole("button", { name: "Drag to reorder" });
  expect(dragHandle).toBeInTheDocument();
});

test("should have correct cursor style on drag handle", () => {
  renderWithDndContext(
    <TrackItem
      track={mockTrack}
      index={0}
      onUpdateTrackConfig={mockOnUpdateTrackConfig}
    />,
  );

  const dragHandle = screen.getByRole("button", { name: "Drag to reorder" });
  expect(dragHandle).toHaveClass("cursor-grab");
});
