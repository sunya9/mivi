import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { testMidiTracks, midiFile } from "tests/fixtures";
import { customRender, customRenderHook } from "tests/util";
import { test, expect, vi } from "vitest";

import { ConfirmDialogHost } from "@/components/app/confirm-dialog-host";
import { toast } from "@/components/ui/toast";
import { createAppContext } from "@/contexts/app-context";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { extractMidiSettings } from "@/lib/midi/midi-settings-store";
import { useMidi, useSetMidiFile } from "@/lib/midi/use-midi";

function TestComponent() {
  const { setMidiFile, midiTracks } = useMidi();
  return (
    <>
      <button onClick={() => setMidiFile(midiFile)} data-testid="load-midi"></button>
      <span data-testid="midi-loaded">{midiTracks ? "loaded" : "empty"}</span>
      <span data-testid="instance-key">{midiTracks?.instanceKey ?? ""}</span>
      <ConfirmDialogHost />
    </>
  );
}

function renderTestComponent() {
  return customRender(<TestComponent />);
}

vi.mock("@/lib/colors/tailwind-colors", () => ({
  getRandomTailwindColor: vi.fn<() => string>(() => "#000000"),
}));

test("restores the stored MIDI file with its persisted settings", async () => {
  const fileStorage = new MemoryFileStorage();
  await fileStorage.write("midi", midiFile);
  localStorage.setItem(
    "mivi:midi-settings",
    JSON.stringify({ ...extractMidiSettings(testMidiTracks), midiOffset: 1.5 }),
  );
  const appContextValue = createAppContext(new AudioContext(), { fileStorage });
  const { result } = await customRenderHook(() => useMidi(), { appContextValue });

  await vi.waitFor(() => expect(result.current.midiTracks).toBeDefined());
  const { instanceKey, ...rest } = result.current.midiTracks!;
  const { instanceKey: _, ...expectedRest } = testMidiTracks;
  expect(rest).toEqual({
    ...expectedRest,
    midiOffset: 1.5,
    tracks: expectedRest.tracks.map((track) => ({ ...track, id: expect.any(String) })),
  });
  expect(typeof instanceKey).toBe("string");
});

test("loads and processes MIDI file", async () => {
  const { result } = await customRenderHook(() => useMidi());

  await act(async () => {
    await result.current.setMidiFile(midiFile);
  });

  const { instanceKey, ...rest } = result.current.midiTracks!;
  const { instanceKey: _, ...expectedRest } = testMidiTracks;
  expect(rest).toEqual({
    ...expectedRest,
    tracks: expectedRest.tracks.map((track) => ({ ...track, id: expect.any(String) })),
  });
  expect(typeof instanceKey).toBe("string");
  expect(instanceKey.length).toBeGreaterThan(0);
  expect(toast.add).toHaveBeenCalledWith({ title: "MIDI file loaded", type: "success" });
});

test("clicking overwrite reloads the MIDI file with new instanceKey", async () => {
  await renderTestComponent();

  const loadButton = screen.getByTestId("load-midi");

  await userEvent.click(loadButton);
  await waitFor(() => expect(screen.getByTestId("midi-loaded")).toHaveTextContent("loaded"));

  // Store the instanceKey from first load
  const originalInstanceKey = screen.getByTestId("instance-key").textContent;

  // Load same file again
  await userEvent.click(loadButton);

  // Wait for dialog and click Overwrite
  await screen.findByText("Same file detected");
  await userEvent.click(screen.getByRole("button", { name: "Overwrite" }));

  await waitFor(() =>
    expect(screen.getByTestId("instance-key").textContent).not.toBe(originalInstanceKey),
  );
});

test("clicking Keep preserves the current MIDI state", async () => {
  await renderTestComponent();

  const loadButton = screen.getByTestId("load-midi");

  await userEvent.click(loadButton);
  await waitFor(() => expect(screen.getByTestId("midi-loaded")).toHaveTextContent("loaded"));

  // Store the instanceKey from first load
  const originalInstanceKey = screen.getByTestId("instance-key").textContent;

  // Load same file again
  await userEvent.click(loadButton);

  // Wait for dialog and click Keep
  await screen.findByText("Same file detected");
  await userEvent.click(screen.getByRole("button", { name: "Keep" }));

  // Verify instanceKey is preserved (state unchanged)
  const updatedInstanceKey = screen.getByTestId("instance-key").textContent;
  expect(updatedInstanceKey).toBe(originalInstanceKey);
});

test("useSetMidiFile does not re-render when tracks are edited", async () => {
  let renders = 0;
  const { result, appContextValue } = await customRenderHook(() => {
    renders++;
    return useSetMidiFile();
  });
  const rendersAfterMount = renders;

  act(() => appContextValue.midiTracksStore.set(testMidiTracks));
  act(() => appContextValue.midiTracksStore.set({ ...testMidiTracks, midiOffset: 1 }));

  expect(renders).toBe(rendersAfterMount);
  expect(typeof result.current).toBe("function");
});

test("useSetMidiFile detects the same file without subscribing to the tracks", async () => {
  function FileOnly() {
    const setMidiFile = useSetMidiFile();
    return (
      <>
        <button onClick={() => setMidiFile(midiFile)} data-testid="load-midi"></button>
        <ConfirmDialogHost />
      </>
    );
  }
  const appContextValue = createAppContext(new AudioContext());
  await customRender(<FileOnly />, { appContextValue });

  await userEvent.click(screen.getByTestId("load-midi"));
  await vi.waitFor(() => expect(appContextValue.midiTracksStore.getSnapshot()).toBeDefined());
  await userEvent.click(screen.getByTestId("load-midi"));

  expect(await screen.findByText("Same file detected")).toBeInTheDocument();
});
