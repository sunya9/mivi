import { test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDnd } from "@/hooks/use-dnd";
import { toast } from "sonner";
import type { DragEvent } from "react";
import { errorLogWithToast } from "@/lib/utils";
import { render } from "@testing-library/react";

vi.mock("sonner", { spy: true });
vi.mock("@/lib/utils", { spy: true });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const onDropMidi = vi.fn();
const onDropAudio = vi.fn();
const onDropImage = vi.fn();

function createDragEvent(files: File[]): DragEvent<HTMLDivElement> {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return {
    preventDefault: vi.fn(),
    dataTransfer: { files: dt.files },
  } as unknown as DragEvent<HTMLDivElement>;
}

test("renders overlay component when dragging", () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const event = createDragEvent([]);
  act(() => {
    result.current.handleDragOver(event);
  });

  const { container } = render(result.current.DragDropOverlay);
  expect(container).toBeInTheDocument();
  expect(container).toHaveTextContent("Drop Files Here");
  expect(container).toHaveTextContent("Supported file formats:");
  expect(container).toHaveTextContent("MIDI files (.mid, .midi)");
  expect(container).toHaveTextContent("Audio files (.mp3, .wav, etc.)");
  expect(container).toHaveTextContent("Image files (.png, .jpg, etc.)");
});

test("does not render overlay component when not dragging", () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const { container } = render(result.current.DragDropOverlay);
  expect(container).toBeEmptyDOMElement();
});

test("removes overlay component after drag leave", () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const dragOverEvent = createDragEvent([]);
  act(() => {
    result.current.handleDragOver(dragOverEvent);
  });

  const { container: containerBefore } = render(result.current.DragDropOverlay);
  expect(containerBefore).toBeInTheDocument();

  const dragLeaveEvent = createDragEvent([]);
  act(() => {
    result.current.handleDragLeave(dragLeaveEvent);
  });

  const { container: containerAfter } = render(result.current.DragDropOverlay);
  expect(containerAfter).toBeEmptyDOMElement();
});

test("handles MIDI file drop", async () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.mid", { type: "audio/midi" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
    expect(onDropMidi).toHaveBeenCalledExactlyOnceWith(file);
    expect(toast.success).toHaveBeenCalledExactlyOnceWith("MIDI file loaded");
  });
});

test("handles audio file drop", async () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.mp3", { type: "audio/mpeg" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropAudio).toHaveBeenCalledExactlyOnceWith(file);
  expect(toast.success).toHaveBeenCalledExactlyOnceWith("Audio file loaded");
});

test("handles image file drop", async () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.png", { type: "image/png" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropImage).toHaveBeenCalledExactlyOnceWith(file);
  expect(toast.success).toHaveBeenCalledExactlyOnceWith("Image file loaded");
});

test("handles unsupported file type", async () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.txt", { type: "text/plain" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropMidi).not.toHaveBeenCalled();
  expect(onDropAudio).not.toHaveBeenCalled();
  expect(onDropImage).not.toHaveBeenCalled();
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith(
    "Unsupported file type: text/plain",
  );
});

test("handles drag over event", () => {
  const { result } = renderHook(() =>
    useDnd({
      onDropMidi,
      onDropAudio,
      onDropImage,
    }),
  );

  const event = createDragEvent([]);

  act(() => {
    result.current.handleDragOver(event);
  });

  expect(event.preventDefault).toHaveBeenCalled();
});

test("handles drag leave event", () => {
  const { result } = renderHook(() =>
    useDnd({
      onDropMidi,
      onDropAudio,
      onDropImage,
    }),
  );

  const event = createDragEvent([]);

  act(() => {
    result.current.handleDragLeave(event);
  });

  expect(event.preventDefault).toHaveBeenCalled();
});

test("handles multiple files drop", async () => {
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const midiFile = new File([""], "test.mid", { type: "audio/midi" });
  const audioFile = new File([""], "test.mp3", { type: "audio/mpeg" });
  const imageFile = new File([""], "test.png", { type: "image/png" });
  const event = createDragEvent([midiFile, audioFile, imageFile]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropMidi).toHaveBeenCalledExactlyOnceWith(midiFile);
  expect(onDropAudio).toHaveBeenCalledExactlyOnceWith(audioFile);
  expect(onDropImage).toHaveBeenCalledExactlyOnceWith(imageFile);
  expect(toast.success).toHaveBeenCalledTimes(3);
});

test("handles MIDI file drop error", async () => {
  const error = new Error("Failed to load MIDI file");
  const onDropMidi = vi.fn().mockRejectedValue(error);

  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.mid", { type: "audio/midi" });
  const event = createDragEvent([file]);

  await act(() => result.current.handleDrop(event));

  expect(onDropMidi).toHaveBeenCalledExactlyOnceWith(file);
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith(
    "Error processing dropped file:",
    error,
  );
});

test("handles audio file drop error", async () => {
  const error = new Error("Failed to load audio file");
  const onDropAudio = vi.fn().mockRejectedValue(error);
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.mp3", { type: "audio/mpeg" });
  const event = createDragEvent([file]);

  await act(() => result.current.handleDrop(event));

  expect(onDropAudio).toHaveBeenCalledExactlyOnceWith(file);
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith(
    "Error processing dropped file:",
    error,
  );
});

test("handles image file drop error", async () => {
  const error = new Error("Failed to load image file");
  const onDropImage = vi.fn().mockRejectedValue(error);
  const { result } = renderHook(() =>
    useDnd({ onDropMidi, onDropAudio, onDropImage }),
  );

  const file = new File([""], "test.png", { type: "image/png" });
  const event = createDragEvent([file]);

  await act(() => result.current.handleDrop(event));

  expect(onDropImage).toHaveBeenCalledExactlyOnceWith(file);
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith(
    "Error processing dropped file:",
    error,
  );
});
