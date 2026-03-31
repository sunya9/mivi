import { test, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { AudioSource } from "@/lib/audio/audio";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { runRecorder } from "@/lib/media-compositor/run-recorder-worker";

vi.mock("@/lib/media-compositor/run-recorder-worker", { spy: true });

const mockAudioSource: AudioSource = {
  name: "test.mp3",
  serialized: {
    length: 100,
    sampleRate: 44100,
    numberOfChannels: 2,
    duration: 10,
    channels: [new Float32Array(100), new Float32Array(100)],
  },
};

const mockProps: Parameters<typeof useRecorder>[0] = {
  audioSource: mockAudioSource,
  midiTracks: testMidiTracks,
  rendererConfig: rendererConfig,
};

test("should initialize with ReadyState", () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: mockProps,
  });
  expect(result.current.recordingState.isRecording).toBe(false);
});

test("should show error toast when trying to start recording without audio file", async () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: {
      ...mockProps,
      audioSource: undefined,
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.error).toHaveBeenCalledExactlyOnceWith("Please select an audio file.", {
    description: undefined,
  });
});

test("should show error toast when trying to start recording without MIDI file", async () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: {
      ...mockProps,
      midiTracks: undefined,
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.error).toHaveBeenCalledExactlyOnceWith("Please select a MIDI file.", {
    description: undefined,
  });
});

test("should allow recording without MIDI when renderer type is none and audio visualizer is enabled", async () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: {
      ...mockProps,
      midiTracks: undefined,
      rendererConfig: {
        ...rendererConfig,
        type: "none" as const,
        audioVisualizerConfig: {
          ...rendererConfig.audioVisualizerConfig,
          style: "bars" as const,
        },
      },
    },
  });
  vi.mocked(runRecorder).mockImplementationOnce(
    () => new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 0)),
  );

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(runRecorder).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      audioSource: mockProps.audioSource,
      midiTracks: undefined,
    }),
    expect.any(Function),
    expect.any(AbortSignal),
  );
});

test("should show error when renderer type is none and audio visualizer is also none", async () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: {
      ...mockProps,
      midiTracks: undefined,
      rendererConfig: {
        ...rendererConfig,
        type: "none" as const,
        audioVisualizerConfig: {
          ...rendererConfig.audioVisualizerConfig,
          style: "none" as const,
        },
      },
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.error).toHaveBeenCalledExactlyOnceWith(
    "Please enable audio visualizer or select a MIDI visualization style.",
    { description: undefined },
  );
});

test("should start recording when all required files are present", async () => {
  const { result } = renderHook(() => useRecorder(mockProps));
  vi.mocked(runRecorder).mockImplementationOnce(
    () => new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 0)),
  );
  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(runRecorder).toHaveBeenCalledExactlyOnceWith(
    {
      rendererConfig: mockProps.rendererConfig,
      midiTracks: mockProps.midiTracks,
      audioSource: mockProps.audioSource,
    },
    expect.any(Function),
    expect.any(AbortSignal),
  );
});

test("should abort recording when toggling during recording", async () => {
  const { result } = renderHook(() => useRecorder(mockProps));
  vi.mocked(runRecorder).mockImplementationOnce(
    () => new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 10)),
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

test("should handle errors during recording", async () => {
  console.error = vi.fn();
  const error = new Error("Recording failed");
  vi.mocked(runRecorder).mockImplementationOnce(
    () =>
      new Promise<Blob>((_, reject) =>
        setTimeout(() => {
          reject(error);
        }, 0),
      ),
  );
  const { result } = renderHook(() => useRecorder(mockProps));

  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");
  await waitFor(async () => {
    await expect(start).resolves.toBeUndefined();
    expect(result.current.recordingState.type).toBe("ready");
    expect(runRecorder).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(console.error).toBeCalledWith("Failed during recording", error);
  });
});

test("should show 'Exporting...' toast when starting export", async () => {
  vi.mocked(runRecorder).mockImplementationOnce(
    () => new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 0)),
  );
  const { result } = renderHook(() => useRecorder(mockProps));

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast).toHaveBeenCalledWith("Exporting...");
});

test("should show success toast when export completes", async () => {
  vi.mocked(runRecorder).mockImplementationOnce(
    () => new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 0)),
  );
  const { result } = renderHook(() => useRecorder(mockProps));

  await act(async () => {
    await result.current.toggleRecording();
  });

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith("Export completed");
  });
});
