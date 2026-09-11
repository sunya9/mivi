import { act, waitFor } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { audioFile, rendererConfig, testMidiTracks } from "tests/fixtures";
import { customRenderHook } from "tests/util";
import { test, expect, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { createAppContext } from "@/contexts/app-context";
import { fileDecoders } from "@/contexts/file-decoders";
import type { SerializedAudio } from "@/lib/audio/audio";
import { runRecorder } from "@/lib/media-compositor/run-recorder-worker";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import type { MidiTracks } from "@/lib/midi/midi";
import type { RendererConfig } from "@/lib/renderers/renderer-config";

vi.mock("@/contexts/file-decoders", { spy: true });
vi.mock("@/lib/media-compositor/run-recorder-worker", { spy: true });

const serializedAudio: SerializedAudio = {
  length: 100,
  sampleRate: 44100,
  numberOfChannels: 2,
  channels: [new Int16Array(100), new Int16Array(100)],
  duration: 100 / 44100,
};

const expectedAudioSource = { name: audioFile.name, serialized: serializedAudio };

async function renderRecorder(
  overrides: { audio?: boolean; midiTracks?: MidiTracks; rendererConfig?: RendererConfig } = {},
) {
  vi.mocked(fileDecoders.audio).mockResolvedValue(serializedAudio);
  const appContextValue = createAppContext(new AudioContext());
  const rendered = await customRenderHook(() => useRecorder(), { appContextValue });
  const { fileStore, midiTracksStore, rendererConfigStore } = rendered.appContextValue;
  if (overrides.audio !== false) {
    await fileStore.audio.setFile(audioFile);
  }
  midiTracksStore.set("midiTracks" in overrides ? overrides.midiTracks : testMidiTracks);
  if (overrides.rendererConfig) rendererConfigStore.set(overrides.rendererConfig);
  return rendered;
}

const resolveSoon = () =>
  new Promise<File>((resolve) => setTimeout(() => resolve(new File([], "export.webm")), 0));

test("should initialize with ReadyState", async () => {
  const { result } = await renderRecorder();
  expect(result.current.recordingState.isRecording).toBe(false);
});

test("should show error toast when trying to start recording without audio file", async () => {
  const { result } = await renderRecorder({ audio: false });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Please select an audio file.",
    description: undefined,
    type: "error",
  });
});

test("should show error toast when trying to start recording without MIDI file", async () => {
  const { result } = await renderRecorder({ midiTracks: undefined });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Please select a MIDI file.",
    description: undefined,
    type: "error",
  });
});

test("should allow recording without MIDI when renderer type is none and audio visualizer is enabled", async () => {
  const { result } = await renderRecorder({
    midiTracks: undefined,
    rendererConfig: {
      ...rendererConfig,
      type: "none",
      audioVisualizerConfig: { ...rendererConfig.audioVisualizerConfig, style: "bars" },
    },
  });
  vi.mocked(runRecorder).mockImplementationOnce(resolveSoon);

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(runRecorder).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ audioSource: expectedAudioSource, midiTracks: undefined }),
    expect.any(Function),
    expect.any(AbortSignal),
  );
});

test("should show error when renderer type is none and audio visualizer is also none", async () => {
  const { result } = await renderRecorder({
    midiTracks: undefined,
    rendererConfig: {
      ...rendererConfig,
      type: "none",
      audioVisualizerConfig: { ...rendererConfig.audioVisualizerConfig, style: "none" },
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Please enable audio visualizer or select a MIDI visualization style.",
    description: undefined,
    type: "error",
  });
});

test("should start recording with the current store values", async () => {
  const { result, appContextValue } = await renderRecorder();
  vi.mocked(runRecorder).mockImplementationOnce(resolveSoon);

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(runRecorder).toHaveBeenCalledExactlyOnceWith(
    {
      rendererConfig: appContextValue.rendererConfigStore.getSnapshot(),
      midiTracks: testMidiTracks,
      audioSource: expectedAudioSource,
      backgroundImageBitmap: undefined,
    },
    expect.any(Function),
    expect.any(AbortSignal),
  );
});

test("should abort recording when toggling during recording", async () => {
  const { result } = await renderRecorder();
  vi.mocked(runRecorder).mockImplementationOnce(
    () =>
      new Promise<File>((resolve) => setTimeout(() => resolve(new File([], "export.webm")), 10)),
  );

  // Start recording
  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");

  // Abort recording
  await act(async () => {
    return result.current.toggleRecording();
  });

  await waitFor(async () => {
    expect(runRecorder).toHaveBeenCalledTimes(1);
    await expect(start).resolves.toBeUndefined();
    expect(result.current.recordingState.type).toBe("ready");
  });
});

test("should show info toast instead of error when cancelling export", async () => {
  const { result } = await renderRecorder();
  vi.mocked(runRecorder).mockImplementationOnce(
    (_resources, _onProgress, signal) =>
      new Promise<File>((_, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
      }),
  );

  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");

  await act(async () => {
    return result.current.toggleRecording();
  });

  await waitFor(async () => {
    await expect(start).resolves.toBeUndefined();
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({ title: "Export cancelled", type: "info" });
    expect(result.current.recordingState.type).toBe("ready");
  });
});

test("should handle errors during recording", async () => {
  console.error = vi.fn<(...data: unknown[]) => void>();
  const error = new Error("Recording failed");
  vi.mocked(runRecorder).mockImplementationOnce(
    () =>
      new Promise<File>((_, reject) =>
        setTimeout(() => {
          reject(error);
        }, 0),
      ),
  );
  const { result } = await renderRecorder();

  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");
  await waitFor(async () => {
    await expect(start).resolves.toBeUndefined();
    expect(result.current.recordingState.type).toBe("ready");
    expect(runRecorder).toHaveBeenCalledTimes(1);
    expect(toast.add).toHaveBeenCalledWith({
      title: "Failed during recording",
      description: error.message,
      type: "error",
    });
    expect(console.error).toBeCalledWith("Failed during recording", error);
  });
});

test("should show success toast when export completes", async () => {
  vi.mocked(runRecorder).mockImplementationOnce(resolveSoon);
  const { result } = await renderRecorder();

  await act(async () => {
    await result.current.toggleRecording();
  });

  await waitFor(() => {
    expect(toast.add).toHaveBeenCalledWith({ title: "Export completed", type: "success" });
  });
});
