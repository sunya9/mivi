import { screen, render } from "@testing-library/react";
import { Canvas } from "@/components/app/canvas";
import { afterEach, expect, test, vi } from "vitest";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof Canvas>;

function renderCanvas(props: Partial<Props> = {}) {
  const onInit = vi.fn<Props["onInit"]>();
  const invalidate = vi.fn<Props["invalidate"]>();
  const baseProps: Props = { aspectRatio: 1, onInit, invalidate };
  const view = render(<Canvas {...baseProps} {...props} />);
  const rerenderCanvas = (next: Partial<Props>) =>
    view.rerender(<Canvas {...baseProps} {...props} {...next} />);
  return { ...view, rerenderCanvas, onInit, invalidate };
}

afterEach(() => {
  vi.restoreAllMocks();
});

function findCanvas() {
  return screen.getByLabelText("Visualized Midi");
}

function mockContainerSize(element: Element, width: number, height: number = width) {
  vi.spyOn(element, "clientWidth", "get").mockReturnValue(width);
  vi.spyOn(element, "clientHeight", "get").mockReturnValue(height);
}

let resizeCallback: (() => void) | undefined;
function stubResizeObserver() {
  resizeCallback = undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class MockResizeObserver extends ResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        super(cb);
        resizeCallback = () => cb([], this);
      }
    },
  );
}

test("should render canvas with correct aspect ratio", () => {
  renderCanvas({ aspectRatio: 2 });
  const canvas = findCanvas();
  expect(canvas).toBeInTheDocument();
  expect(canvas).toHaveStyle({ aspectRatio: "2" });
});

test("should call onInit with canvas context", () => {
  const { onInit } = renderCanvas();
  expect(onInit).toHaveBeenCalledExactlyOnceWith(expect.any(CanvasRenderingContext2D));
});

test("should call invalidate when container is resized", () => {
  stubResizeObserver();

  const { container, invalidate } = renderCanvas();
  mockContainerSize(container.firstElementChild!, 300);

  invalidate.mockClear();
  resizeCallback?.();

  expect(invalidate).toHaveBeenCalledOnce();
  const canvas = findCanvas();
  expect(canvas).toHaveProperty("width", 300 * window.devicePixelRatio);
});

test("should update canvas dimensions when aspectRatio changes", () => {
  const { container, rerenderCanvas, invalidate } = renderCanvas();
  mockContainerSize(container.firstElementChild!, 200);

  invalidate.mockClear();

  rerenderCanvas({ aspectRatio: 0.5 });

  expect(invalidate).toHaveBeenCalled();
  const canvas = findCanvas();
  expect(canvas).toHaveStyle({ aspectRatio: "0.5" });
  // aspectRatio=0.5 (tall), container=200x200 → height-constrained: width=100, height=200
  expect(canvas).toHaveProperty("width", 100 * window.devicePixelRatio);
  expect(canvas).toHaveProperty("height", 200 * window.devicePixelRatio);
});

test("should apply custom className to container", () => {
  const { container } = renderCanvas({ className: "custom-class" });

  expect(container.firstElementChild).toHaveClass("custom-class");
});
