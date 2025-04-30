import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "@/components/app/app-header";
import {
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";

const mockToggleRecording = vi.fn();

const defaultProps = {
  recordingState: new ReadyState(),
  toggleRecording: mockToggleRecording,
};

test("renders correctly with default props", () => {
  render(<AppHeader {...defaultProps} />);

  expect(screen.getByRole("heading")).toHaveTextContent("MiVi");
  expect(screen.getByRole("button")).toHaveTextContent("Start export");
});

test("shows recording state UI when recording", () => {
  const recordingProps = {
    ...defaultProps,
    recordingState: new RecordingState(0.5),
  };

  render(<AppHeader {...recordingProps} />);

  const progressbar = screen.getByRole("progressbar");
  expect(
    screen.getByRole("button", { name: "Stop export" }),
  ).toBeInTheDocument();
  expect(progressbar).toHaveValue(50);
});

test("calls toggleRecording when button is clicked", async () => {
  render(<AppHeader {...defaultProps} />);

  const button = screen.getByText("Start export");
  await userEvent.click(button);

  expect(mockToggleRecording).toHaveBeenCalledTimes(1);
});
