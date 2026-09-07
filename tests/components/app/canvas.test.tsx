import { screen } from "@testing-library/react";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { createMockAppContext, customRender } from "tests/util";
import { afterEach, expect, test, vi } from "vitest";

import { Canvas } from "@/components/app/canvas";

async function renderCanvas(className?: string) {
  const appContextValue = createMockAppContext(createMockStore());
  const engine = appContextValue.visualizerEngine;
  const fitCanvas = vi.spyOn(engine, "fitCanvas");
  const view = await customRender(<Canvas className={className} />, { appContextValue });
  return { ...view, engine, fitCanvas };
}

afterEach(() => {
  vi.restoreAllMocks();
});

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

test("mounts the engine's canvas", async () => {
  const { engine } = await renderCanvas();
  expect(screen.getByLabelText("Visualized Midi")).toBe(engine.canvas);
});

test("detaches the canvas on unmount without destroying it", async () => {
  const { engine, unmount } = await renderCanvas();
  unmount();
  expect(engine.canvas.isConnected).toBe(false);
  expect(engine.canvas.getAttribute("aria-label")).toBe("Visualized Midi");
});

test("fits the canvas to the container on mount and on resize", async () => {
  stubResizeObserver();
  const { container, fitCanvas } = await renderCanvas();
  expect(fitCanvas).toHaveBeenCalled();

  mockContainerSize(container.firstElementChild!, 300, 150);
  fitCanvas.mockClear();
  resizeCallback?.();

  expect(fitCanvas).toHaveBeenCalledExactlyOnceWith(300, 150);
});

test("applies a custom className to the container", async () => {
  const { container } = await renderCanvas("custom-class");
  expect(container.firstElementChild).toHaveClass("custom-class");
});
