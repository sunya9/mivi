import { act, waitFor } from "@testing-library/react";
import { usePlayer } from "../../../src/lib/player/use-player";
import { customRenderHook } from "../../util";
import { beforeEach, expect, test, vi } from "vitest";
import { audioBuffer } from "tests/fixtures";
import { appContextValue } from "@/lib/globals";

beforeEach(() => {
  vi.clearAllMocks();
});

test("should initialize with default values", () => {
  const { result } = customRenderHook(() => usePlayer(audioBuffer));

  expect(result.current.isPlaying).toBe(false);
  expect(result.current.volume).toBe(1);
  expect(result.current.muted).toBe(false);
  expect(result.current.currentTimeSec).toBe(0);
});

test("should toggle play/pause state", async () => {
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

test("should handle seeking", async () => {
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

    expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(
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
  expect(gainNode.gain.setTargetAtTime).toHaveBeenCalledWith(
    0,
    expect.any(Number),
    0,
  );
});
