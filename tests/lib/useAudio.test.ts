import { test, expect } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { useAudio } from "@/lib/useAudio";
import { audioFile, invalidFile } from "../fixtures";
import { customRenderHook } from "tests/util";
import { saveFile } from "@/lib/fileDb";

test("returns initial state", async () => {
  const { result } = await act(() => customRenderHook(() => useAudio()));
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("audioBuffer is defined after call setAudioFile", async () => {
  const { result } = await act(() => customRenderHook(() => useAudio()));
  await waitFor(() => result.current.setAudioFile(audioFile));
  expect(result.current.audioBuffer).toBeDefined();
  expect(result.current.serializedAudio).toBeDefined();
  expect(result.current.audioFile).toBeDefined();
});

test("sets audioBuffer to undefined when setAudioFile is called with undefined", async () => {
  const { result } = await act(() => customRenderHook(() => useAudio()));
  await waitFor(() => result.current.setAudioFile(audioFile));
  expect(result.current.audioBuffer).toBeDefined();
  expect(result.current.serializedAudio).toBeDefined();
  expect(result.current.audioFile).toBeDefined();
  await waitFor(async () => await result.current.setAudioFile(undefined));
  expect(result.current.audioBuffer).toBeUndefined();
  expect(result.current.serializedAudio).toBeUndefined();
  expect(result.current.audioFile).toBeUndefined();
});

test.todo("loads and processes audio file", async () => {
  await saveFile("audio", audioFile);
  const { result } = await act(() => customRenderHook(() => useAudio()));
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
  });
});

// TODO
test.todo("handles audio file loading errors", async () => {
  const { result } = await act(() => customRenderHook(() => useAudio()));

  await waitFor(async () => {
    await expect(
      result.current.setAudioFile(invalidFile),
    ).rejects.toThrowError();
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});
