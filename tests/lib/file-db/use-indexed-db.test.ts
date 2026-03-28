import { expect, test, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { saveValue } from "@/lib/file-db/file-db";
import { useAudioFileDb, type FileDbEntry } from "@/lib/file-db/file-db-store";
import { type StoredAudioData } from "@/lib/audio/audio";
import { toast } from "sonner";

const mockFile = new File(["test content"], "test.txt", {
  type: "text/plain",
});

// Use a real schema key for testing
const testKey = "db:audio" as const;
const mockEntry: FileDbEntry<StoredAudioData> = {
  file: mockFile,
  decoded: {
    channels: [new Float32Array(1)],
    sampleRate: 44100,
    length: 1,
    numberOfChannels: 1,
  },
};

test("should initialize with undefined when no entry exists", async () => {
  const { result } = customRenderHook(() => useAudioFileDb());
  await waitFor(() => {
    expect(result.current.file).toBeUndefined();
    expect(result.current.decoded).toBeUndefined();
  });
});

test("should initialize with cached entry when available", async () => {
  await saveValue(testKey, mockEntry);
  const { result } = customRenderHook(() => useAudioFileDb());
  await waitFor(() => {
    expect(result.current.file?.name).toBe(mockFile.name);
    expect(result.current.decoded).toBeDefined();
  });
});

test("should set and save entry successfully", async () => {
  const { result } = customRenderHook(() => useAudioFileDb());

  await waitFor(async () => {
    await result.current.setEntry(mockEntry);
    expect(result.current.file).toEqual(mockFile);
    expect(result.current.decoded).toBeDefined();
  });
});

test("should clear entry when set to undefined", async () => {
  await saveValue(testKey, mockEntry);
  const { result } = customRenderHook(() => useAudioFileDb());

  await waitFor(async () => {
    await result.current.setEntry(undefined);
    expect(result.current.file).toBeUndefined();
    expect(result.current.decoded).toBeUndefined();
  });
});

test("should handle saveValue error gracefully", async () => {
  const error = new Error("Failed to save file");
  const saveSpy = vi
    .spyOn(await import("@/lib/file-db/file-db"), "saveValue")
    .mockRejectedValue(error);
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const toastSpy = vi.spyOn(toast, "error");

  const { result } = customRenderHook(() => useAudioFileDb());

  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setEntry(mockEntry);

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith("Failed to save file", error);
    expect(toastSpy).toHaveBeenCalledWith("Failed to save file", {
      description: error.message,
    });
  });

  consoleSpy.mockRestore();
  toastSpy.mockRestore();
  saveSpy.mockRestore();
});
