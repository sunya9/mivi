import { waitFor } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { audioFile } from "tests/fixtures";
import { customRenderHook } from "tests/util";
import { test, expect, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { createAppContext } from "@/contexts/app-context";
import type { SerializedAudio } from "@/lib/audio/audio";
import { floatToInt16 } from "@/lib/audio/pcm";
import { runDecodeWorker } from "@/lib/audio/run-decode-worker";
import { useAudio, useSetAudioFile } from "@/lib/audio/use-audio";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";

vi.mock("@/lib/audio/run-decode-worker", { spy: true });

const mockAudioContext = new AudioContext();
const mockAudioBuffer = mockAudioContext.createBuffer(2, 44100, 44100);
const mockAudio: SerializedAudio = {
  channels: Array.from({ length: mockAudioBuffer.numberOfChannels }, (_, i) =>
    floatToInt16(mockAudioBuffer.getChannelData(i)),
  ),
  sampleRate: mockAudioBuffer.sampleRate,
  length: mockAudioBuffer.length,
  numberOfChannels: mockAudioBuffer.numberOfChannels,
  duration: 1,
};

async function renderAudioHook(seed?: File) {
  const fileStorage = new MemoryFileStorage();
  if (seed) await fileStorage.write("audio", seed);
  const appContextValue = createAppContext(new AudioContext(), { fileStorage });
  return customRenderHook(() => useAudio(), { appContextValue });
}

test("returns initial state", async () => {
  const { result, appContextValue } = await renderAudioHook();
  await waitFor(() => {
    expect(appContextValue.audioPlaybackStore.getSnapshot().duration).toBe(0);
    expect(result.current.audioFile).toBeUndefined();
  });
});

test("decodes a stored file on startup and feeds the playback store", async () => {
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(mockAudio);
  const { result, appContextValue } = await renderAudioHook(audioFile);

  expect(result.current.audioFile).toBe(audioFile);
  await waitFor(() => {
    expect(appContextValue.audioPlaybackStore.getSnapshot().duration).toBeGreaterThan(0);
    expect(result.current.isDecoding).toBe(false);
  });
});

test("playback store receives the buffer after setAudioFile", async () => {
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(mockAudio);
  const { result, appContextValue } = await renderAudioHook();
  await result.current.setAudioFile(audioFile);
  await waitFor(() => {
    expect(appContextValue.audioPlaybackStore.getSnapshot().duration).toBeGreaterThan(0);
    expect(result.current.audioFile).toBeDefined();
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Audio file loaded",
      type: "success",
    });
  });
  expect(runDecodeWorker).toHaveBeenCalledWith(audioFile, expect.any(AbortSignal));
});

test("cancelDecode aborts in-progress decode and resets isDecoding", async () => {
  let resolveWorker!: (value: SerializedAudio) => void;
  vi.mocked(runDecodeWorker).mockImplementationOnce(
    (_file, signal: AbortSignal) =>
      new Promise<SerializedAudio>((resolve, reject) => {
        resolveWorker = resolve;
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );
  const { result, appContextValue } = await renderAudioHook();

  const promise = result.current.setAudioFile(audioFile);
  await waitFor(() => expect(result.current.isDecoding).toBe(true));

  result.current.cancelDecode();
  await promise;

  await waitFor(() => {
    expect(result.current.isDecoding).toBe(false);
    expect(appContextValue.audioPlaybackStore.getSnapshot().duration).toBe(0);
    expect(result.current.audioFile).toBeUndefined();
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Audio loading cancelled",
      type: "info",
    });
  });
  resolveWorker(mockAudio);
  await waitFor(() => {
    expect(appContextValue.audioPlaybackStore.getSnapshot().duration).toBe(0);
  });
});

test("cancelDecode does nothing while idle", async () => {
  const { result } = await renderAudioHook();
  result.current.cancelDecode();
  expect(toast.add).not.toHaveBeenCalled();
});

test("useSetAudioFile does not re-render while the file decodes", async () => {
  vi.mocked(runDecodeWorker).mockResolvedValueOnce(mockAudio);
  const appContextValue = createAppContext(new AudioContext(), {
    fileStorage: new MemoryFileStorage(),
  });
  let renders = 0;
  const { result } = await customRenderHook(
    () => {
      renders++;
      return useSetAudioFile();
    },
    { appContextValue },
  );
  const rendersAfterMount = renders;

  await result.current(audioFile);

  expect(appContextValue.fileStore.audio.getSnapshot().file).toBe(audioFile);
  expect(renders).toBe(rendersAfterMount);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Audio file loaded",
    type: "success",
  });
});
