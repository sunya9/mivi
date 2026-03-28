import { test, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAudio } from "@/lib/audio/use-audio";
import { audioFile, invalidFile } from "../../fixtures";
import { customRenderHook } from "tests/util";
import { saveValue } from "@/lib/file-db/file-db";
import { AppContext, createAppContext } from "@/contexts/app-context";
import { FileDbStoreProvider } from "@/components/providers/file-db-store-provider";
import { type FileDbEntry } from "@/lib/file-db/file-db-store";
import { toast } from "sonner";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { AudioContext } from "standardized-audio-context-mock";

vi.mock("sonner", { spy: true });

// Create a mock stored audio entry
const mockAudioContext = new AudioContext();
const mockAudioBuffer = mockAudioContext.createBuffer(2, 44100, 44100);
const mockStoredEntry: FileDbEntry<{
  channels: Float32Array[];
  sampleRate: number;
  length: number;
  numberOfChannels: number;
}> = {
  file: audioFile,
  decoded: {
    channels: Array.from({ length: mockAudioBuffer.numberOfChannels }, (_, i) =>
      mockAudioBuffer.getChannelData(i),
    ),
    sampleRate: mockAudioBuffer.sampleRate,
    length: mockAudioBuffer.length,
    numberOfChannels: mockAudioBuffer.numberOfChannels,
  },
};

// Simple test wrapper without ErrorBoundary
function TestWrapper({
  children,
  audioContext = new AudioContext(),
}: {
  children: React.ReactNode;
  audioContext?: AudioContext;
}) {
  const appContextValue = createAppContext(audioContext);
  return (
    <ThemeProvider themes={["light", "dark"]} defaultTheme="light" attribute="class">
      <FileDbStoreProvider>
        <AppContext value={appContextValue}>
          <Suspense fallback={null}>{children}</Suspense>
        </AppContext>
      </FileDbStoreProvider>
    </ThemeProvider>
  );
}

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
  const { result } = customRenderHook(() => useAudio());
  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
    expect(toast.success).toHaveBeenCalledExactlyOnceWith("Audio file loaded");
  });
});

test("sets audioBuffer to undefined when setAudioFile is called with undefined", async () => {
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

test("handles audio file loading errors", async () => {
  const audioContext = new AudioContext();
  const error = new Error("Failed to decode audio data");
  audioContext.decodeAudioData = vi.fn().mockRejectedValue(error);
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const { result } = renderHook(() => useAudio(), {
    wrapper: ({ children }) => <TestWrapper audioContext={audioContext}>{children}</TestWrapper>,
  });

  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(invalidFile);

  expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith("Failed to set audio file", error);
  expect(toast.error).toHaveBeenCalledExactlyOnceWith("Failed to set audio file", {
    description: error.message,
  });
  expect(result.current.audioBuffer).toBeUndefined();
  expect(result.current.audioFile).toBeUndefined();
});
