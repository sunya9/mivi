import { act } from "@testing-library/react";
import { useAudioPlaybackStore } from "@/lib/player/use-audio-playback-store";
import { customRenderHook } from "../../util";
import { afterEach, expect, test, vi } from "vitest";
import { audioBuffer } from "tests/fixtures";
import { registrar } from "standardized-audio-context-mock";
import { AppContextValue } from "@/lib/globals";

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Helper to get AudioBufferSourceNodes from registrar using the appContext's audioContext
function getSourceNodes(appContextValue: AppContextValue) {
  // The audioContext in appContextValue is the one used by the hook
  // Cast needed because the mock's AudioContext type differs from native AudioContext
  return registrar.getAudioNodes(
    appContextValue.audioContext as unknown as Parameters<
      typeof registrar.getAudioNodes
    >[0],
    "AudioBufferSourceNode",
  );
}

// Helper to render hook and set up audioBuffer
function renderWithAudioBuffer() {
  const renderResult = customRenderHook(() => useAudioPlaybackStore());
  act(() => {
    renderResult.result.current.setAudioBuffer(audioBuffer);
  });
  return renderResult;
}

// Helper to render hook with context access and set up audioBuffer
function renderWithAudioBufferAndContext() {
  const renderResult = customRenderHook(() => useAudioPlaybackStore());
  act(() => {
    renderResult.result.current.setAudioBuffer(audioBuffer);
  });
  return renderResult;
}

test("should initialize with default values", () => {
  const { result } = renderWithAudioBuffer();

  expect(result.current.snapshot.isPlaying).toBe(false);
  expect(result.current.snapshot.volume).toBe(1);
  expect(result.current.snapshot.muted).toBe(false);
  expect(result.current.snapshot.position).toBe(0);
  expect(result.current.snapshot.duration).toBe(audioBuffer.duration);
});

test("should toggle play/pause state", () => {
  const { result } = renderWithAudioBuffer();
  expect(result.current.snapshot.isPlaying).toBe(false);

  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);
  act(() => {
    result.current.togglePlay();
  });

  expect(result.current.snapshot.isPlaying).toBe(false);
});

test("should handle seeking", () => {
  const { result } = renderWithAudioBuffer();

  act(() => {
    result.current.seek(50, true);
  });

  expect(result.current.getPosition()).toBe(50);
});

test("should handle volume changes", () => {
  const { result } = renderWithAudioBuffer();

  act(() => {
    result.current.setVolume(0.5);
  });

  expect(result.current.snapshot.volume).toBe(0.5);
});

test("should handle mute toggle", () => {
  const { result } = renderWithAudioBuffer();

  act(() => {
    result.current.toggleMute();
  });

  expect(result.current.snapshot.muted).toBe(true);
});

test("should reset playback time when audioBuffer becomes undefined via store", () => {
  const { result } = renderWithAudioBuffer();

  // Seek to a position
  act(() => {
    result.current.seek(50, true);
  });
  expect(result.current.getPosition()).toBe(50);
  expect(result.current.snapshot.position).toBe(50);

  // Remove audio buffer via store
  act(() => {
    result.current.setAudioBuffer(undefined);
  });

  // Playback time should be reset
  expect(result.current.getPosition()).toBe(0);
  expect(result.current.snapshot.position).toBe(0);
});

test("should stop playing and reset when audioBuffer becomes undefined during playback", () => {
  const { result } = renderWithAudioBuffer();

  // Start playing and seek to a position
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);

  act(() => {
    result.current.seek(30, true);
  });

  // Remove audio buffer while playing via store
  act(() => {
    result.current.setAudioBuffer(undefined);
  });

  // Should stop playing and reset time
  expect(result.current.snapshot.isPlaying).toBe(false);
  expect(result.current.getPosition()).toBe(0);
  expect(result.current.snapshot.position).toBe(0);
});

test("should snap seek time to 0 when time is less than 1 second", () => {
  const { result } = renderWithAudioBuffer();

  act(() => {
    result.current.seek(0.5, true);
  });

  expect(result.current.getPosition()).toBe(0);
  expect(result.current.snapshot.position).toBe(0);
});

test("should not snap seek time when time is 1 second or more", () => {
  const { result } = renderWithAudioBuffer();

  act(() => {
    result.current.seek(1, true);
  });

  expect(result.current.getPosition()).toBe(1);
  expect(result.current.snapshot.position).toBe(1);
});

test("should maintain playing state during seamless seek", () => {
  const { result } = renderWithAudioBuffer();

  // Start playing
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);

  // Seamless seek (keyboard-style) - should stay playing
  act(() => {
    result.current.seek(30, true, true);
  });

  // Should still be playing after seamless seek
  expect(result.current.snapshot.isPlaying).toBe(true);
  expect(result.current.snapshot.position).toBe(30);
});

test("should enter seeking state without committing when commit is false", () => {
  const { result } = renderWithAudioBuffer();

  // Start playing first
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);

  // Seek without commit (preview)
  act(() => {
    result.current.seek(30, false);
  });

  // Should be in seeking state (not playing)
  expect(result.current.snapshot.isPlaying).toBe(false);
});

test("should update currentTimeSec when seeking from paused state", () => {
  const { result } = renderWithAudioBuffer();

  // Start paused
  expect(result.current.snapshot.isPlaying).toBe(false);

  // Seek without commit
  act(() => {
    result.current.seek(30, false);
  });

  // Time should be updated
  expect(result.current.snapshot.position).toBe(30);
  expect(result.current.snapshot.isPlaying).toBe(false);
});

test("should not resume playing after seek commit when was paused", () => {
  const { result } = renderWithAudioBuffer();

  // Start paused
  expect(result.current.snapshot.isPlaying).toBe(false);

  // Seek with commit
  act(() => {
    result.current.seek(30, true);
  });

  // Should remain paused
  expect(result.current.snapshot.isPlaying).toBe(false);
  expect(result.current.snapshot.position).toBe(30);
});

test("should do nothing when play is called without audioBuffer", () => {
  // Don't set audioBuffer for this test
  const { result } = customRenderHook(() => useAudioPlaybackStore());

  act(() => {
    result.current.togglePlay();
  });

  // Should remain not playing
  expect(result.current.snapshot.isPlaying).toBe(false);
});

test("should create and stop source when pausing", () => {
  const { result, appContextValue } = renderWithAudioBufferAndContext();

  // Start playing
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);
  const sourceNodes = getSourceNodes(appContextValue);
  expect(sourceNodes.length).toBe(1);

  // Pause
  act(() => {
    result.current.togglePlay();
  });

  // After pausing, isPlaying should be false
  expect(result.current.snapshot.isPlaying).toBe(false);
});

test("should transition to paused state when ended event fires", () => {
  const { result, appContextValue } = renderWithAudioBufferAndContext();

  // Start playing
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);

  const sourceNodes = getSourceNodes(appContextValue);
  expect(sourceNodes.length).toBe(1);
  const source = sourceNodes[0];

  // Simulate ended event using dispatchEvent (natural playback end)
  act(() => {
    source.dispatchEvent(new Event("ended"));
  });

  // Should be paused and time should be at duration
  expect(result.current.snapshot.isPlaying).toBe(false);
  expect(result.current.snapshot.position).toBe(audioBuffer.duration);
});

test("should not transition to paused when ended fires on old source after manual stop", () => {
  const { result, appContextValue } = renderWithAudioBufferAndContext();

  // Start playing
  act(() => {
    result.current.togglePlay();
  });

  const firstSourceNodes = getSourceNodes(appContextValue);
  expect(firstSourceNodes.length).toBe(1);
  const firstSource = firstSourceNodes[0];

  // Pause (manually stop)
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(false);

  // Start playing again (creates new source)
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);

  // Old source's ended event fires (should be ignored)
  act(() => {
    firstSource.dispatchEvent(new Event("ended"));
  });

  // Should still be playing (ended event from old source was ignored)
  expect(result.current.snapshot.isPlaying).toBe(true);
});

test("should update currentTimeSec when updateCurrentTime is called during playback", () => {
  const { result, appContextValue } = renderWithAudioBufferAndContext();

  // Start playing
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.snapshot.isPlaying).toBe(true);
  expect(result.current.snapshot.position).toBe(0);

  // Simulate time passing (audioContext.currentTime advances)
  Object.defineProperty(appContextValue.audioContext, "currentTime", {
    value: 5,
    writable: true,
  });

  // Call syncFromAudioContext (simulates animation frame callback)
  act(() => {
    result.current.syncFromAudioContext();
  });

  // position should be updated based on elapsed time
  expect(result.current.snapshot.position).toBe(5);
});
