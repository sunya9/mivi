import { test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAudio } from "@/lib/audio/use-audio";
import { audioFile, invalidFile } from "../../fixtures";
import { customRenderHook } from "tests/util";
import { saveFile } from "@/lib/file-db/file-db";
import { AppContext } from "@/contexts/app-context";
import { appContextValue } from "@/lib/globals";
import { Providers } from "@/components/providers/providers";
import { toast } from "sonner";
import { audioDbKey } from "@/lib/audio/use-audio";

vi.mock("sonner", { spy: true });

beforeEach(() => {
  vi.clearAllMocks();
});

test("returns initial state", async () => {
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("audioBuffer is defined when cache exists in indexedDb", async () => {
  await saveFile(audioDbKey, audioFile);
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
  });
});

test("audioBuffer is defined after call setAudioFile", async () => {
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => result.current.setAudioFile(audioFile));
  expect(result.current.audioBuffer).toBeDefined();
  expect(result.current.serializedAudio).toBeDefined();
  expect(result.current.audioFile).toBeDefined();
});

test("sets audioBuffer to undefined when setAudioFile is called with undefined", async () => {
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => result.current.setAudioFile(audioFile));
  expect(result.current.audioBuffer).toBeDefined();
  expect(result.current.serializedAudio).toBeDefined();
  expect(result.current.audioFile).toBeDefined();
  await waitFor(async () => await result.current.setAudioFile(undefined));
  expect(result.current.audioBuffer).toBeUndefined();
  expect(result.current.serializedAudio).toBeUndefined();
  expect(result.current.audioFile).toBeUndefined();
});

test("audioBuffer is undefined if failed to load initial audio buffer", async () => {
  await saveFile(audioDbKey, audioFile);
  const audioContext = new AudioContext();
  const error = new Error("Failed to decode audio data");
  vi.mocked(audioContext.decodeAudioData).mockImplementation(() => {
    throw error;
  });
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const { result } = renderHook(() => useAudio(), {
    wrapper: ({ children }) => (
      <Providers>
        <AppContext value={{ ...appContextValue, audioContext }}>
          {children}
        </AppContext>
      </Providers>
    ),
  });
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
      "Failed to create audio buffer from file",
      error,
    );
  });
});
test("handles audio file loading errors", async () => {
  const audioContext = new AudioContext();
  vi.mocked(audioContext.decodeAudioData).mockImplementation(() => {
    throw new Error("Failed to decode audio data");
  });
  console.error = vi.fn();
  const { result } = renderHook(() => useAudio(), {
    wrapper: ({ children }) => (
      <Providers>
        <AppContext
          value={{
            ...appContextValue,
            audioContext,
          }}
        >
          {children}
        </AppContext>
      </Providers>
    ),
  });

  await waitFor(async () => {
    await expect(
      result.current.setAudioFile(invalidFile),
    ).resolves.toBeUndefined();
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      "Failed to set audio file",
    );
    expect(console.error).toHaveBeenCalledExactlyOnceWith(
      "Failed to set audio file",
      new Error("Failed to decode audio data"),
    );
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});
