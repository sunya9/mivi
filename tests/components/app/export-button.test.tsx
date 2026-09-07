import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { audioFile, testMidiTracks } from "tests/fixtures";
import { customRender } from "tests/util";
import { test, expect, vi } from "vitest";

import { ExportButton } from "@/components/app/export-button";
import { createAppContext } from "@/contexts/app-context";
import { fileDecoders } from "@/contexts/file-decoders";
import type { SerializedAudio } from "@/lib/audio/audio";
import { runRecorder } from "@/lib/media-compositor/run-recorder-worker";

vi.mock("@/contexts/file-decoders", { spy: true });
vi.mock("@/lib/media-compositor/run-recorder-worker", () => ({
  // Never resolves so the recording state stays observable
  runRecorder: vi.fn<typeof runRecorder>(() => new Promise(() => {})),
}));

const serializedAudio: SerializedAudio = {
  channels: [new Int16Array(44100)],
  sampleRate: 44100,
  length: 44100,
  numberOfChannels: 1,
  duration: 1,
};

async function renderReadyToExport() {
  vi.mocked(fileDecoders.audio).mockResolvedValue(serializedAudio);
  const appContextValue = createAppContext(new AudioContext());
  appContextValue.midiTracksStore.set(testMidiTracks);
  await appContextValue.fileStore.audio.setFile(audioFile);
  return customRender(<ExportButton />, { appContextValue });
}

test("offers to start an export when idle", async () => {
  await customRender(<ExportButton />);
  expect(screen.getByRole("button")).toHaveTextContent("Start export");
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

test("switches to the recording UI and reports progress", async () => {
  await renderReadyToExport();

  await userEvent.click(screen.getByRole("button", { name: "Start export" }));

  expect(runRecorder).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: /Stop export/ })).toBeInTheDocument();
  expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();

  const onProgress = vi.mocked(runRecorder).mock.calls[0][1];
  act(() => onProgress(0.5, { name: "Video Encode", eta: "00:10" }));

  expect(screen.getByRole("progressbar")).toHaveValue(50);
  expect(screen.getByText(/Video Encode/)).toBeInTheDocument();
});
