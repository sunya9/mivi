import { useCallback, useEffect, useRef, useState } from "react";

interface UsePanelVisibilityOptions {
  isPlaying: boolean;
  autoHideDelay?: number;
}

interface UsePanelVisibilityReturn {
  panelVisible: boolean;
  isRevealed: boolean;
  startInteraction: () => void;
  endInteraction: () => void;
  showPanel: () => void;
  handleMouseMove: () => void;
  handleTouchReveal: () => boolean;
}

// Single state variable instead of multiple booleans
// - idle: no interaction, panel hidden (when playing), first tap shows panel
// - hovering: mouse moving over canvas, panel visible with auto-hide timer
// - interacting: slider being dragged, panel visible (no auto-hide)
// - revealed: shown via touch/keyboard, panel visible with auto-hide
type PanelState = "idle" | "hovering" | "interacting" | "revealed";

export function usePanelVisibility({
  isPlaying,
  autoHideDelay = 3000,
}: UsePanelVisibilityOptions): UsePanelVisibilityReturn {
  const [state, setState] = useState<PanelState>("idle");
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const startHideTimer = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      // Return to idle, so next tap will show panel again
      setState("idle");
      hideTimerRef.current = null;
    }, autoHideDelay);
  }, [autoHideDelay, clearHideTimer]);

  // Track previous isPlaying and update state during render (React recommended pattern)
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevIsPlaying, setPrevIsPlaying] = useState(isPlaying);
  if (prevIsPlaying !== isPlaying) {
    setPrevIsPlaying(isPlaying);
    if (!isPlaying) {
      // Playback stopped: reset to idle
      setState("idle");
    } else if (state === "idle") {
      // Playback started: show panel
      setState("revealed");
    }
  }

  // Handle timer for playback state changes (side effects only)
  useEffect(() => {
    if (!isPlaying) {
      clearHideTimer();
    } else if (state === "revealed" || state === "hovering") {
      // When playing and panel is visible, ensure timer is running
      startHideTimer();
    }
  }, [isPlaying, state, clearHideTimer, startHideTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  // Panel is visible when not playing, or when in a visible state
  const panelVisible = !isPlaying || state !== "idle";

  const startInteraction = useCallback(() => {
    clearHideTimer();
    setState("interacting");
  }, [clearHideTimer]);

  const endInteraction = useCallback(() => {
    if (isPlaying) {
      // Keep panel visible briefly after interaction ends
      setState("hovering");
      startHideTimer();
    } else {
      setState("idle");
    }
  }, [isPlaying, startHideTimer]);

  const showPanel = useCallback(() => {
    setState("revealed");
    startHideTimer();
  }, [startHideTimer]);

  const handleMouseMove = useCallback(() => {
    setState("hovering");
    if (isPlaying) {
      startHideTimer();
    }
  }, [isPlaying, startHideTimer]);

  // Returns true if the touch was consumed (panel revealed), false if should proceed with toggle play
  const handleTouchReveal = useCallback((): boolean => {
    if (!isPlaying) {
      return false;
    }

    if (state === "idle") {
      // Panel hidden: show panel (tap consumed)
      setState("revealed");
      startHideTimer();
      return true;
    } else {
      // Panel visible: allow toggle play, but reset hide timer
      startHideTimer();
      return false;
    }
  }, [isPlaying, state, startHideTimer]);

  return {
    panelVisible,
    isRevealed: state === "revealed",
    startInteraction,
    endInteraction,
    showPanel,
    handleMouseMove,
    handleTouchReveal,
  };
}
