import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import { Canvas } from "@/components/app/canvas";
import { expect, test, vi } from "vitest";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";

const mockOnInit = vi.fn();
const mockInvalidate = vi.fn();
const mockOnClickCanvas = vi.fn();
const defaultProps: ComponentProps<typeof Canvas> = {
  aspectRatio: 1,
  onInit: mockOnInit,
  invalidate: mockInvalidate,
  onClickCanvas: mockOnClickCanvas,
};

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
  render(<Canvas {...defaultProps} />);
  expect(mockOnInit).toHaveBeenCalledExactlyOnceWith(
    expect.any(CanvasRenderingContext2D),
  );
});

test("should call onRedraw when canvas is resized", async () => {
  let resizeCallback: ((element: Element) => void) | undefined;
  class MockedResizeObserver implements ResizeObserver {
    constructor(
      private callback: ConstructorParameters<typeof ResizeObserver>[0],
    ) {
      resizeCallback = (element: Element) =>
        this.callback(
          [
            {
              borderBoxSize: [{ blockSize: 0, inlineSize: 0 }],
              contentBoxSize: [{ blockSize: 0, inlineSize: 0 }],
              contentRect: DOMRectReadOnly.fromRect({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
              }),
              devicePixelContentBoxSize: [{ blockSize: 0, inlineSize: 0 }],
              target: element,
            },
          ],
          this,
        );
    }
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
  }

  window.ResizeObserver = MockedResizeObserver;

  render(<Canvas {...defaultProps} />);

  const canvas = findCanvas();
  expect(canvas).toBeInTheDocument();
  await waitFor(() => {
    resizeCallback?.(canvas);
    expect(mockInvalidate).toHaveBeenCalledExactlyOnceWith();
  });
});

test("should call onClickCanvas when canvas is left-clicked", async () => {
  render(<Canvas {...defaultProps} />);

  const canvas = findCanvas();
  await userEvent.click(canvas);

  expect(mockOnClickCanvas).toHaveBeenCalled();
});

test("should not call onClickCanvas when canvas is right-clicked", () => {
  render(<Canvas {...defaultProps} />);

  const canvas = findCanvas();
  fireEvent.pointerUp(canvas, { button: 2 });

  expect(mockOnClickCanvas).not.toHaveBeenCalled();
});

test("should not call onClickCanvas when canvas is middle-clicked", () => {
  render(<Canvas {...defaultProps} />);

  const canvas = findCanvas();
  fireEvent.pointerUp(canvas, { button: 1 });

  expect(mockOnClickCanvas).not.toHaveBeenCalled();
});

test("should apply custom className", () => {
  const customClassName = "custom-class";
  render(<Canvas {...defaultProps} className={customClassName} />);

  const canvas = findCanvas();
  expect(canvas).toHaveClass(customClassName);
});
