import { test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDnd } from "@/hooks/use-dnd";
import type { DragEvent } from "react";
import { errorLogWithToast } from "@/lib/utils";
import { render } from "@testing-library/react";

vi.mock("@/lib/utils", { spy: true });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

type DndProps = Parameters<typeof useDnd>[0];

function renderDnd(overrides?: Partial<DndProps>) {
  const props: DndProps = {
    onDropMidi: vi.fn<DndProps["onDropMidi"]>(),
    onDropAudio: vi.fn<DndProps["onDropAudio"]>(),
    onDropImage: vi.fn<DndProps["onDropImage"]>(),
    ...overrides,
  };
  const { result } = renderHook(() => useDnd(props));
  return { result, ...props };
}

function createDragEvent(files: File[]): DragEvent<HTMLDivElement> {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return {
    preventDefault: vi.fn<() => void>(),
    dataTransfer: { files: dt.files },
  } as unknown as DragEvent<HTMLDivElement>;
}

test("renders overlay component when dragging", () => {
  const { result } = renderDnd();

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
  const { result } = renderDnd();

  const { container } = render(result.current.DragDropOverlay);
  expect(container).toBeEmptyDOMElement();
});

test("removes overlay component after drag leave", () => {
  const { result } = renderDnd();

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
  const { result, onDropMidi } = renderDnd();

  const file = new File([""], "test.mid", { type: "audio/midi" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
    expect(onDropMidi).toHaveBeenCalledExactlyOnceWith(file);
  });
});

test("handles audio file drop", async () => {
  const { result, onDropAudio } = renderDnd();

  const file = new File([""], "test.mp3", { type: "audio/mpeg" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropAudio).toHaveBeenCalledExactlyOnceWith(file);
});

test("handles image file drop", async () => {
  const { result, onDropImage } = renderDnd();

  const file = new File([""], "test.png", { type: "image/png" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropImage).toHaveBeenCalledExactlyOnceWith(file);
});

test("handles unsupported file type", async () => {
  const { result, onDropMidi, onDropAudio, onDropImage } = renderDnd();

  const file = new File([""], "test.txt", { type: "text/plain" });
  const event = createDragEvent([file]);

  await act(async () => {
    await result.current.handleDrop(event);
  });

  expect(onDropMidi).not.toHaveBeenCalled();
  expect(onDropAudio).not.toHaveBeenCalled();
  expect(onDropImage).not.toHaveBeenCalled();
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith("Unsupported file type: text/plain");
});

test("handles drag over event", () => {
  const { result } = renderDnd();

  const event = createDragEvent([]);

  act(() => {
    result.current.handleDragOver(event);
  });

  expect(event.preventDefault).toHaveBeenCalled();
});

test("handles drag leave event", () => {
  const { result } = renderDnd();

  const event = createDragEvent([]);

  act(() => {
    result.current.handleDragLeave(event);
  });

  expect(event.preventDefault).toHaveBeenCalled();
});

test("handles multiple files drop", async () => {
  const { result, onDropMidi, onDropAudio, onDropImage } = renderDnd();

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
});

test("handles MIDI file drop error", async () => {
  const error = new Error("Failed to load MIDI file");
  const onDropMidi = vi.fn<DndProps["onDropMidi"]>().mockRejectedValue(error);

  const { result } = renderDnd({ onDropMidi });

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
  const onDropAudio = vi.fn<DndProps["onDropAudio"]>().mockRejectedValue(error);
  const { result } = renderDnd({ onDropAudio });

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
  const onDropImage = vi.fn<DndProps["onDropImage"]>().mockRejectedValue(error);
  const { result } = renderDnd({ onDropImage });

  const file = new File([""], "test.png", { type: "image/png" });
  const event = createDragEvent([file]);

  await act(() => result.current.handleDrop(event));

  expect(onDropImage).toHaveBeenCalledExactlyOnceWith(file);
  expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith(
    "Error processing dropped file:",
    error,
  );
});
