import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePanelVisibility } from "@/hooks/use-panel-visibility";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Basic behavior
test("panelVisible is true when not playing", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: false }));
  expect(result.current.panelVisible).toBe(true);
});

test("panelVisible is false when playing and no interaction", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));
  expect(result.current.panelVisible).toBe(false);
});

// Mouse operations (desktop)
test("panelVisible becomes true on handleMouseMove when playing", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  act(() => {
    result.current.handleMouseMove();
  });

  expect(result.current.panelVisible).toBe(true);
});

test("panelVisible becomes false after autoHideDelay when mouse stops moving", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.handleMouseMove();
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.panelVisible).toBe(false);
});

test("handleMouseMove resets hide timer", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.handleMouseMove();
  });

  act(() => {
    vi.advanceTimersByTime(1500);
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    result.current.handleMouseMove();
  });

  act(() => {
    vi.advanceTimersByTime(1500);
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(result.current.panelVisible).toBe(false);
});

// Mobile touch operations - core behavior
test("mobile: tap while playing shows panel (returns true)", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  expect(result.current.panelVisible).toBe(false);

  let returnValue: boolean;
  act(() => {
    returnValue = result.current.handleTouchReveal();
  });

  // First tap shows panel, does NOT toggle play
  expect(returnValue!).toBe(true);
  expect(result.current.panelVisible).toBe(true);
});

test("mobile: tap while panel visible allows toggle play (returns false)", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  // First tap: show panel
  act(() => {
    result.current.handleTouchReveal();
  });
  expect(result.current.panelVisible).toBe(true);

  // Second tap: should allow toggle play
  let returnValue: boolean;
  act(() => {
    returnValue = result.current.handleTouchReveal();
  });

  expect(returnValue!).toBe(false);
  expect(result.current.panelVisible).toBe(true);
});

test("mobile: tap after auto-hide shows panel again (returns true)", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  // First tap: show panel
  act(() => {
    result.current.handleTouchReveal();
  });
  expect(result.current.panelVisible).toBe(true);

  // Wait for auto-hide
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.panelVisible).toBe(false);

  // Tap again: should show panel (NOT toggle play)
  let returnValue: boolean;
  act(() => {
    returnValue = result.current.handleTouchReveal();
  });

  expect(returnValue!).toBe(true);
  expect(result.current.panelVisible).toBe(true);
});

test("mobile: handleTouchReveal returns false when not playing", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: false }));

  let returnValue: boolean;
  act(() => {
    returnValue = result.current.handleTouchReveal();
  });

  // Not playing = panel always visible, tap should toggle play
  expect(returnValue!).toBe(false);
  expect(result.current.panelVisible).toBe(true);
});

test("mobile: panel auto-hides after autoHideDelay when touch revealed", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.handleTouchReveal();
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.panelVisible).toBe(false);
});

// Slider interaction
test("panelVisible is true during interaction", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  act(() => {
    result.current.startInteraction();
  });

  expect(result.current.panelVisible).toBe(true);
});

test("startInteraction cancels hide timer", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.handleMouseMove();
  });

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  act(() => {
    result.current.startInteraction();
  });

  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.panelVisible).toBe(true);
});

test("panelVisible respects other conditions after endInteraction", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  act(() => {
    result.current.startInteraction();
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    result.current.endInteraction();
  });
  expect(result.current.panelVisible).toBe(false);
});

// showPanel (keyboard shortcut like M key)
test("showPanel makes panelVisible true", () => {
  const { result } = renderHook(() => usePanelVisibility({ isPlaying: true }));

  act(() => {
    result.current.showPanel();
  });

  expect(result.current.panelVisible).toBe(true);
});

test("panel auto-hides after autoHideDelay when showPanel called", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: true, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.showPanel();
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.panelVisible).toBe(false);
});

// Playback state transitions
test("panel shows briefly when playback starts then auto-hides", () => {
  const { result, rerender } = renderHook(
    ({ isPlaying }) => usePanelVisibility({ isPlaying, autoHideDelay: 2000 }),
    { initialProps: { isPlaying: false } },
  );

  expect(result.current.panelVisible).toBe(true);

  rerender({ isPlaying: true });

  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.panelVisible).toBe(false);
});

test("timer is cleared when isPlaying becomes false", () => {
  const { result, rerender } = renderHook(
    ({ isPlaying }) => usePanelVisibility({ isPlaying, autoHideDelay: 2000 }),
    { initialProps: { isPlaying: true } },
  );

  act(() => {
    result.current.handleMouseMove();
  });

  rerender({ isPlaying: false });

  act(() => {
    vi.advanceTimersByTime(3000);
  });

  expect(result.current.panelVisible).toBe(true);
});

test("handleMouseMove does not start timer when not playing", () => {
  const { result } = renderHook(() =>
    usePanelVisibility({ isPlaying: false, autoHideDelay: 2000 }),
  );

  act(() => {
    result.current.handleMouseMove();
  });
  expect(result.current.panelVisible).toBe(true);

  act(() => {
    vi.advanceTimersByTime(3000);
  });

  expect(result.current.panelVisible).toBe(true);
});
