import { test, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { SerializedAudio } from "@/lib/audio/audio";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
import { runWorker } from "@/lib/media-compositor/run-worker";

vi.mock("@/lib/media-compositor/run-worker", { spy: true });
vi.mock("sonner", { spy: true });

beforeEach(() => {
  vi.clearAllMocks();
});

const mockSerializedAudio: SerializedAudio = {
  length: 100,
  sampleRate: 44100,
  numberOfChannels: 2,
  duration: 10,
  channels: [new Float32Array(100), new Float32Array(100)],
};

const mockProps: Parameters<typeof useRecorder>[0] = {
  serializedAudio: mockSerializedAudio,
  midiTracks: expectedMidiTracks,
  rendererConfig: rendererConfig,
};

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("@/lib/media-compositor/worker-wrapper", { spy: true });

test("should initialize with ReadyState", () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: mockProps,
  });
  expect(result.current.recordingState.isRecording).toBe(false);
});

test("should show error toast when trying to start recording without required files", async () => {
  const { result } = renderHook((props) => useRecorder(props), {
    initialProps: {
      ...mockProps,
      serializedAudio: undefined,
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.error).toHaveBeenCalledExactlyOnceWith(
    "Please select a MIDI file and audio file.",
  );
});

test("should start recording when all required files are present", async () => {
  const { result } = renderHook(() => useRecorder(mockProps));
  vi.mocked(runWorker).mockImplementationOnce(
    () =>
      new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 0)),
  );
  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(runWorker).toHaveBeenCalledExactlyOnceWith(
    {
      rendererConfig: mockProps.rendererConfig,
      midiTracks: mockProps.midiTracks,
      serializedAudio: mockProps.serializedAudio,
    },
    expect.any(Function),
    expect.any(AbortSignal),
  );
});

test("should abort recording when toggling during recording", async () => {
  const { result } = renderHook(() => useRecorder(mockProps));
  vi.mocked(runWorker).mockImplementationOnce(
    () =>
      new Promise<Blob>((resolve) => setTimeout(() => resolve(new Blob()), 10)),
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
    expect(runWorker).toHaveBeenCalledTimes(1);
    await expect(start).resolves.toBeUndefined();
    expect(result.current.recordingState.type).toBe("ready");
  });
});

test("should handle errors during recording", async () => {
  console.error = vi.fn();
  const error = new Error("Recording failed");
  vi.mocked(runWorker).mockImplementationOnce(
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
    expect(runWorker).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(console.error).toBeCalledWith("Failed during recording", error);
  });
});
