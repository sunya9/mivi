import { test, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAudio } from "@/lib/audio/use-audio";
import { audioFile, invalidFile } from "../../fixtures";
import { customRenderHook } from "tests/util";
import { saveFile } from "@/lib/file-db/file-db";
import { AppContext } from "@/contexts/app-context";
import { createAppContext } from "@/lib/globals";
import { CacheProvider } from "@/lib/cache/cache-provider";
import { toast } from "sonner";
import { audioDbKey } from "@/lib/audio/use-audio";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

vi.mock("sonner", { spy: true });

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
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <CacheProvider>
        <AppContext value={appContextValue}>
          <Suspense fallback={null}>{children}</Suspense>
        </AppContext>
      </CacheProvider>
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
  // Wait for initial render to complete (Suspense)
  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
  });
});

test("sets audioBuffer to undefined when setAudioFile is called with undefined", async () => {
  const { result } = customRenderHook(() => useAudio());
  // Wait for initial render to complete (Suspense)
  await waitFor(() => expect(result.current).not.toBeNull());
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeDefined();
    expect(result.current.serializedAudio).toBeDefined();
    expect(result.current.audioFile).toBeDefined();
  });
  await result.current.setAudioFile(undefined);
  await waitFor(() => {
    expect(result.current.audioBuffer).toBeUndefined();
    expect(result.current.serializedAudio).toBeUndefined();
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("audioBuffer is undefined if failed to load initial audio buffer", async () => {
  await saveFile(audioDbKey, audioFile);
  const audioContext = new AudioContext();
  const error = new Error("Failed to decode audio data");
  // decodeAudioData returns a Promise, so mock should reject
  audioContext.decodeAudioData = vi.fn().mockRejectedValue(error);
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const { result } = renderHook(() => useAudio(), {
    wrapper: ({ children }) => (
      <TestWrapper audioContext={audioContext}>{children}</TestWrapper>
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
  const error = new Error("Failed to decode audio data");
  // decodeAudioData returns a Promise, so mock should reject
  audioContext.decodeAudioData = vi.fn().mockRejectedValue(error);
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const { result } = renderHook(() => useAudio(), {
    wrapper: ({ children }) => (
      <TestWrapper audioContext={audioContext}>{children}</TestWrapper>
    ),
  });

  // Wait for initial render to complete (Suspense)
  await waitFor(() => expect(result.current).not.toBeNull());

  // Call setAudioFile and wait for it to complete
  await result.current.setAudioFile(invalidFile);

  // Verify error handling
  expect(toast.error).toHaveBeenCalledExactlyOnceWith(
    "Failed to set audio file",
  );
  expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
    "Failed to set audio file",
    error,
  );
  expect(result.current.audioBuffer).toBeUndefined();
  expect(result.current.serializedAudio).toBeUndefined();
  expect(result.current.audioFile).toBeUndefined();
});
