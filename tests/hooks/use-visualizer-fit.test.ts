import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVisualizerFit } from "@/hooks/use-visualizer-fit";

// Helper: attach a mock container element to the ref
function attachContainer(
  result: { current: ReturnType<typeof useVisualizerFit> },
  rect: { width: number; height: number },
) {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({ width: rect.width, height: rect.height }) as DOMRect;
  // Assign to the ref's current property
  Object.defineProperty(result.current.containerRef, "current", {
    value: el,
    writable: true,
  });
}

// --- getVisualizerOptimalHeight ---

test("getVisualizerOptimalHeight returns undefined when container is not attached", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  expect(result.current.getVisualizerOptimalHeight()).toBeUndefined();
});

test("getVisualizerOptimalHeight calculates height from container width and aspect ratio", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  attachContainer(result, { width: 960, height: 0 });

  // 960 * (1080 / 1920) = 540
  expect(result.current.getVisualizerOptimalHeight()).toBe(540);
});

test("getVisualizerOptimalHeight handles square resolution", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 500, height: 500 }));
  attachContainer(result, { width: 300, height: 0 });

  // 300 * (500 / 500) = 300
  expect(result.current.getVisualizerOptimalHeight()).toBe(300);
});

// --- getCenterFitSize ---

test("getCenterFitSize returns undefined when container is not attached", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  expect(result.current.getCenterFitSize("left", { left: 200, visualizer: 400 })).toBeUndefined();
});

test("getCenterFitSize returns undefined when visualizer size is missing", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  attachContainer(result, { width: 800, height: 0 });

  expect(result.current.getCenterFitSize("left", { left: 200 })).toBeUndefined();
});

test("getCenterFitSize returns undefined when sidePanel size is missing", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  attachContainer(result, { width: 800, height: 0 });

  expect(result.current.getCenterFitSize("left", { visualizer: 400 })).toBeUndefined();
});

test("getCenterFitSize calculates new side panel size to fit center to canvas width", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  attachContainer(result, { width: 800, height: 0 });

  // desiredCenterWidth = 400 * (1920 / 1080) ≈ 711.11
  // newSidePanel = 200 + (800 - 711.11) ≈ 288.89
  const newSize = result.current.getCenterFitSize("left", {
    left: 200,
    visualizer: 400,
  });
  expect(newSize).toBeCloseTo(288.89, 1);
});

test("getCenterFitSize shrinks side panel when center is narrower than desired", () => {
  const { result } = renderHook(() => useVisualizerFit({ width: 1920, height: 1080 }));
  attachContainer(result, { width: 500, height: 0 });

  // desiredCenterWidth = 400 * (1920 / 1080) ≈ 711.11
  // newSidePanel = 300 + (500 - 711.11) ≈ 88.89
  const newSize = result.current.getCenterFitSize("right", {
    right: 300,
    visualizer: 400,
  });
  expect(newSize).toBeCloseTo(88.89, 1);
});
