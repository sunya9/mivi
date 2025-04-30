import { screen, render } from "@testing-library/react";
import { Canvas } from "@/components/canvas";
import { beforeEach, expect, test, vi } from "vitest";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";

const mockOnInit = vi.fn();
const mockOnRedraw = vi.fn();
const mockOnClickCanvas = vi.fn();
const defaultProps: ComponentProps<typeof Canvas> = {
  aspectRatio: 1,
  onInit: mockOnInit,
  onRedraw: mockOnRedraw,
  onClickCanvas: mockOnClickCanvas,
};

beforeEach(() => {
  vi.clearAllMocks();
});

function findCanvas() {
  return screen.getByLabelText("Visualized Midi");
}

test("should render canvas with correct aspect ratio", () => {
  render(<Canvas {...defaultProps} aspectRatio={2} />);
  const canvas = findCanvas();
  expect(canvas).toBeInTheDocument();
  expect(canvas).toHaveStyle({ aspectRatio: "0.5" });
});

test("should call onInit with canvas context", () => {
  const mockGetContext = vi.fn().mockReturnValue({});
  HTMLCanvasElement.prototype.getContext = mockGetContext;

  render(<Canvas {...defaultProps} />);

  expect(mockGetContext).toHaveBeenCalledWith("2d");
  expect(mockOnInit).toHaveBeenCalledWith({});
});

test.todo("should call onRedraw when canvas is resized", () => {
  render(<Canvas {...defaultProps} />);

  // Simulate window resize
  // TODO

  expect(mockOnRedraw).toHaveBeenCalled();
});

test("should call onClickCanvas when canvas is clicked", async () => {
  render(<Canvas {...defaultProps} />);

  const canvas = findCanvas();
  await userEvent.click(canvas);

  expect(mockOnClickCanvas).toHaveBeenCalled();
});

test("should apply custom className", () => {
  const customClassName = "custom-class";
  render(<Canvas {...defaultProps} className={customClassName} />);

  const canvas = findCanvas();
  expect(canvas).toHaveClass(customClassName);
});
