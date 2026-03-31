import { test, expect, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { useAudio } from "@/lib/audio/use-audio";
import { audioFile, invalidFile } from "../../fixtures";
import { customRenderHook } from "tests/util";
import { saveValue } from "@/lib/file-db/file-db";
import type { FileDbEntry } from "@/lib/file-db/file-db-store";
import { toast } from "sonner";
import { AudioContext } from "standardized-audio-context-mock";
import type { StoredAudioData } from "@/lib/audio/audio";
import { runDecodeWorker } from "@/lib/audio/run-decode-worker";

vi.mock("sonner", { spy: true });

vi.mock("@/lib/audio/run-decode-worker", { spy: true });

// Create a mock stored audio entry
const mockAudioContext = new AudioContext();
const mockAudioBuffer = mockAudioContext.createBuffer(2, 44100, 44100);
const mockStoredAudio: StoredAudioData = {
  channels: Array.from({ length: mockAudioBuffer.numberOfChannels }, (_, i) =>
    mockAudioBuffer.getChannelData(i),
  ),
  sampleRate: mockAudioBuffer.sampleRate,
  length: mockAudioBuffer.length,
  numberOfChannels: mockAudioBuffer.numberOfChannels,
};
const mockStoredEntry: FileDbEntry<StoredAudioData> = {
  file: audioFile,
  decoded: mockStoredAudio,
};

test("returns initial state", async () => {
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("audioBuffer is defined when entry exists in indexedDb", async () => {
  await saveValue("db:audio", mockStoredEntry);
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
  });
});

test("audioBuffer is defined after call setAudioFile", async () => {
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(mockStoredAudio);
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
    expect(toast.success).toHaveBeenCalledExactlyOnceWith("Audio file loaded");
  });
  expect(runDecodeWorker).toHaveBeenCalledWith(audioFile, expect.any(AbortSignal));
});

test("sets audioBuffer to undefined when setAudioFile is called with undefined", async () => {
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(mockStoredAudio);
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
  });
  await result.current.setAudioFile(undefined);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("cancelDecode aborts in-progress decode and resets isDecoding", async () => {
  let resolveWorker!: (value: StoredAudioData) => void;
  vi.mocked(runDecodeWorker).mockImplementationOnce(
    (_file, signal: AbortSignal) =>
      new Promise<StoredAudioData>((resolve, reject) => {
        resolveWorker = resolve;
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => expect(result.current).not.toBeNull());

  const promise = result.current.setAudioFile(audioFile);
  await waitFor(() => expect(result.current.isDecoding).toBe(true));

  result.current.cancelDecode();
  await promise;

  await waitFor(() => {
    expect(result.current.isDecoding).toBe(false);
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
    expect(toast.info).toHaveBeenCalledExactlyOnceWith("Audio loading cancelled");
  });
  // Ensure resolving after cancel has no effect
  resolveWorker(mockStoredAudio);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
  });
});

test("re-entry: second setAudioFile discards first decode result", async () => {
  let resolveFirst!: (value: StoredAudioData) => void;
  vi.mocked(runDecodeWorker).mockImplementationOnce(
    (_file, signal: AbortSignal) =>
      new Promise<StoredAudioData>((resolve, reject) => {
        resolveFirst = resolve;
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );

  const secondAudio: StoredAudioData = {
    ...mockStoredAudio,
    sampleRate: 22050,
  };
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(secondAudio);

  const secondFile = new File(["second"], "second.mp3", { type: "audio/mpeg" });

  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => expect(result.current).not.toBeNull());

  // Start first decode (will hang)
  const firstPromise = result.current.setAudioFile(audioFile);
  await waitFor(() => expect(result.current.isDecoding).toBe(true));

  // Start second decode (aborts first, resolves immediately)
  await result.current.setAudioFile(secondFile);
  await firstPromise;

  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.audioFile).toBe(secondFile);
    expect(result.current.isDecoding).toBe(false);
  });

  // Resolving first after second completed has no effect
  resolveFirst(mockStoredAudio);
  await waitFor(() => {
    expect(result.current.audioFile).toBe(secondFile);
  });
});

test("handles audio file loading errors", async () => {
  const error = new Error("Failed to decode audio data");
  vi.mocked(runDecodeWorker).mockRejectedValueOnce(error);
  const consoleErrorSpy = vi.spyOn(console, "error");
  const { result } = customRenderHook(() => useAudio());

  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(invalidFile);

  expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith("Failed to set audio file", error);
  expect(toast.error).toHaveBeenCalledExactlyOnceWith("Failed to set audio file", {
    description: error.message,
  });
  expect(result.current.audioBuffer).toBeUndefined();
  expect(result.current.audioFile).toBeUndefined();
});
