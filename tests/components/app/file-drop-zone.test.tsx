import { fireEvent, screen, waitFor } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { midiFile } from "tests/fixtures";
import { customRender } from "tests/util";
import { beforeEach, expect, test, vi } from "vitest";

import { FileDropZone } from "@/components/app/file-drop-zone";
import { createAppContext } from "@/contexts/app-context";
import { fileDecoders } from "@/contexts/file-decoders";
import type { SerializedAudio } from "@/lib/audio/audio";
import { errorLogWithToast } from "@/lib/error-toast";

const serializedAudio: SerializedAudio = {
  channels: [new Int16Array(1)],
  sampleRate: 44100,
  length: 1,
  numberOfChannels: 1,
  duration: 1 / 44100,
};

vi.mock("@/contexts/file-decoders", { spy: true });
vi.mock("@/lib/error-toast", { spy: true });

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(fileDecoders.audio).mockResolvedValue(serializedAudio);
  vi.mocked(fileDecoders.backgroundImage).mockResolvedValue(
    await createImageBitmap(new OffscreenCanvas(1, 1)),
  );
});

async function renderDropZone() {
  const appContextValue = createAppContext(new AudioContext());
  await customRender(
    <FileDropZone>
      <div data-testid="content">content</div>
    </FileDropZone>,
    { appContextValue },
  );
  return { appContextValue, target: screen.getByTestId("content") };
}

function dataTransfer(files: File[]) {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return dt;
}

test("shows the overlay while dragging and hides it on leave", async () => {
  const { target } = await renderDropZone();

  fireEvent.dragOver(target, { dataTransfer: dataTransfer([]) });
  expect(screen.getByText("Drop Files Here")).toBeInTheDocument();
  expect(screen.getByText("MIDI files (.mid, .midi)")).toBeInTheDocument();

  fireEvent.dragLeave(target, { dataTransfer: dataTransfer([]) });
  expect(screen.queryByText("Drop Files Here")).not.toBeInTheDocument();
});

test("routes dropped files to their slots", async () => {
  const { appContextValue, target } = await renderDropZone();
  const audio = new File([""], "test.mp3", { type: "audio/mpeg" });
  const image = new File([""], "test.png", { type: "image/png" });

  fireEvent.dragOver(target, { dataTransfer: dataTransfer([]) });
  fireEvent.drop(target, { dataTransfer: dataTransfer([midiFile, audio, image]) });

  await waitFor(() => {
    expect(appContextValue.midiTracksStore.getSnapshot()?.name).toBe("test.mid");
    expect(appContextValue.fileStore.audio.getSnapshot().file).toBe(audio);
    expect(appContextValue.fileStore.backgroundImage.getSnapshot().file).toBe(image);
  });
  expect(screen.queryByText("Drop Files Here")).not.toBeInTheDocument();
});

test("reports unsupported file types", async () => {
  const { target } = await renderDropZone();

  fireEvent.drop(target, {
    dataTransfer: dataTransfer([new File([""], "test.txt", { type: "text/plain" })]),
  });

  await waitFor(() =>
    expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith("Unsupported file type: text/plain"),
  );
});

test("reports a setter that throws", async () => {
  const error = new Error("boom");
  vi.mocked(fileDecoders.audio).mockRejectedValueOnce(error);
  const { target } = await renderDropZone();

  fireEvent.drop(target, {
    dataTransfer: dataTransfer([new File([""], "test.mp3", { type: "audio/mpeg" })]),
  });

  await waitFor(() =>
    expect(errorLogWithToast).toHaveBeenCalledExactlyOnceWith("Failed to load audio file", error),
  );
});
