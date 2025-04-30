import { test, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useStartRecording } from "@/lib/media-compositor/use-start-recording";
import { SerializedAudio } from "@/lib/audio";
import { startRecording } from "@/lib/media-compositor/recorder";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";

vi.mock("@/lib/media-compositor/recorder", { spy: true });
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

const mockProps: Parameters<typeof useStartRecording>[0] = {
  serializedAudio: mockSerializedAudio,
  midiTracks: expectedMidiTracks,
  rendererConfig: rendererConfig,
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("should initialize with ReadyState", () => {
  const { result } = renderHook((props) => useStartRecording(props), {
    initialProps: mockProps,
  });
  expect(result.current.recordingState.isRecording).toBe(false);
});

test("should show error toast when trying to start recording without required files", async () => {
  const { result } = renderHook((props) => useStartRecording(props), {
    initialProps: {
      ...mockProps,
      serializedAudio: undefined,
    },
  });

  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(toast.error).toHaveBeenCalledWith(
    "Please select a MIDI file and audio file.",
  );
});

test("should start recording when all required files are present", async () => {
  const { result } = renderHook(() => useStartRecording(mockProps));
  vi.mocked(startRecording).mockImplementationOnce(
    () => new Promise<void>((resolve) => setTimeout(resolve, 0)),
  );
  await act(async () => {
    await result.current.toggleRecording();
  });

  expect(startRecording).toHaveBeenCalledWith({
    onChangeRecordingStatus: expect.any(Function),
    rendererConfig: mockProps.rendererConfig,
    midiTracks: mockProps.midiTracks,
    serializedAudio: mockProps.serializedAudio,
    signal: expect.any(AbortSignal),
  });
});

test("should abort recording when toggling during recording", async () => {
  const { result } = renderHook(() => useStartRecording(mockProps));
  vi.mocked(startRecording).mockImplementationOnce(
    () => new Promise<void>((resolve) => setTimeout(resolve, 10)),
  );

  // Start recording
  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");

  // // Abort recording
  await act(async () => {
    return result.current.toggleRecording();
  });

  await waitFor(async () => {
    expect(startRecording).toHaveBeenCalledTimes(1);
    await expect(start).resolves.toBeUndefined();
    expect(result.current.recordingState.type).toBe("ready");
  });
});

test("should handle errors during recording", async () => {
  console.error = vi.fn();
  vi.mocked(startRecording).mockImplementationOnce(
    () =>
      new Promise<void>((_, reject) =>
        setTimeout(() => {
          reject(new Error("Recording failed"));
        }, 0),
      ),
  );
  const { result } = renderHook(() => useStartRecording(mockProps));

  let start: Promise<void> | undefined;
  act(() => {
    start = result.current.toggleRecording();
  });
  expect(result.current.recordingState.type).toBe("recording");
  await expect(start).rejects.toThrow("failed to start recording");
  await waitFor(() => {
    expect(result.current.recordingState.type).toBe("ready");
  });
  expect(startRecording).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(2);
});
