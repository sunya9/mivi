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
