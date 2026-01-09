import { act, waitFor } from "@testing-library/react";
import { usePlayer } from "../../../src/lib/player/use-player";
import { customRenderHook } from "../../util";
import { expect, test } from "vitest";
import { audioBuffer } from "tests/fixtures";
import { appContextValue } from "@/lib/globals";

test("should initialize with default values", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  expect(result.current.isPlaying).toBe(false);
  expect(result.current.volume).toBe(1);
  expect(result.current.muted).toBe(false);
  expect(result.current.currentTimeSec).toBe(0);
});

test("should toggle play/pause state", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));
  expect(result.current.isPlaying).toBe(false);

  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.isPlaying).toBe(true);
  act(() => {
    result.current.togglePlay();
  });

  expect(result.current.isPlaying).toBe(false);
});

test("should handle seeking", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  act(() => {
    result.current.seek(50, true);
  });

  expect(result.current.getCurrentTime()).toBe(50);
});

test("should handle volume changes", async () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  act(() => {
    result.current.setVolume(0.5);
  });
  const { gainNode } = appContextValue;
  await waitFor(() => {
    expect(result.current.volume).toBe(0.5);

    expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledExactlyOnceWith(
      0.5,
      expect.any(Number),
      0,
    );
  });
});

test("should handle mute toggle", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));
  const { gainNode } = appContextValue;
  act(() => {
    result.current.toggleMute();
  });

  expect(result.current.muted).toBe(true);
  expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledExactlyOnceWith(
    0,
    expect.any(Number),
    0,
  );
});

test("should reset playback time when audioBuffer becomes undefined", () => {
  const { result, rerender } = customRenderHook(
    ({ buffer }: { buffer: AudioBuffer | undefined }) => usePlayer(buffer),
    { initialProps: { buffer: audioBuffer as AudioBuffer | undefined } },
  );

  // Seek to a position
  act(() => {
    result.current.seek(50, true);
  });
  expect(result.current.getCurrentTime()).toBe(50);
  expect(result.current.currentTimeSec).toBe(50);

  // Remove audio buffer
  rerender({ buffer: undefined });

  // Playback time should be reset
  expect(result.current.getCurrentTime()).toBe(0);
  expect(result.current.currentTimeSec).toBe(0);
});

test("should stop playing and reset when audioBuffer becomes undefined during playback", () => {
  const { result, rerender } = customRenderHook(
    ({ buffer }: { buffer: AudioBuffer | undefined }) => usePlayer(buffer),
    { initialProps: { buffer: audioBuffer as AudioBuffer | undefined } },
  );

  // Start playing and seek to a position
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.isPlaying).toBe(true);

  act(() => {
    result.current.seek(30, true);
  });

  // Remove audio buffer while playing
  rerender({ buffer: undefined });

  // Should stop playing and reset time
  expect(result.current.isPlaying).toBe(false);
  expect(result.current.getCurrentTime()).toBe(0);
  expect(result.current.currentTimeSec).toBe(0);
});

test("should snap seek time to 0 when time is less than 1 second", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  act(() => {
    result.current.seek(0.5, true);
  });

  expect(result.current.getCurrentTime()).toBe(0);
  expect(result.current.currentTimeSec).toBe(0);
});

test("should not snap seek time when time is 1 second or more", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  act(() => {
    result.current.seek(1, true);
  });

  expect(result.current.getCurrentTime()).toBe(1);
  expect(result.current.currentTimeSec).toBe(1);
});

test("should enter seeking state without committing when commit is false", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  // Start playing first
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.isPlaying).toBe(true);

  // Seek without commit (preview)
  act(() => {
    result.current.seek(30, false);
  });

  // Should be in seeking state (not playing)
  expect(result.current.isPlaying).toBe(false);
});

test("should update currentTimeSec when seeking from paused state", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  // Start paused
  expect(result.current.isPlaying).toBe(false);

  // Seek without commit
  act(() => {
    result.current.seek(30, false);
  });

  // Time should be updated
  expect(result.current.currentTimeSec).toBe(30);
  expect(result.current.isPlaying).toBe(false);
});

test("should resume playing after seek commit when was playing", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  // Start playing
  act(() => {
    result.current.togglePlay();
  });
  expect(result.current.isPlaying).toBe(true);

  // Seek without commit first
  act(() => {
    result.current.seek(30, false);
  });
  expect(result.current.isPlaying).toBe(false);

  // Then commit
  act(() => {
    result.current.makeSureToCommit();
  });

  // Should resume playing
  expect(result.current.isPlaying).toBe(true);
});

test("should not resume playing after seek commit when was paused", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  // Start paused
  expect(result.current.isPlaying).toBe(false);

  // Seek with commit
  act(() => {
    result.current.seek(30, true);
  });

  // Should remain paused
  expect(result.current.isPlaying).toBe(false);
  expect(result.current.currentTimeSec).toBe(30);
});

test("should do nothing when play is called without audioBuffer", () => {
  const { result } = customRenderHook(() => usePlayer(undefined));

  act(() => {
    result.current.togglePlay();
  });

  // Should remain not playing
  expect(result.current.isPlaying).toBe(false);
});
