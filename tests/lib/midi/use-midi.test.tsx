import { test, expect, vi } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMidi } from "@/lib/midi/use-midi";
import { expectedMidiTracks, midiFile } from "tests/fixtures";
import { MidiTracks } from "@/lib/midi/midi";

function TestComponent() {
  const { setMidiFile, midiTracks, ConfirmDialog } = useMidi();
  return (
    <>
      <button
        onClick={() => setMidiFile(midiFile)}
        data-testid="load-midi"
      ></button>
      <span data-testid="midi-loaded">{midiTracks ? "loaded" : "empty"}</span>
      <span data-testid="instance-key">{midiTracks?.instanceKey ?? ""}</span>
      {ConfirmDialog}
    </>
  );
}

function renderTestComponent() {
  return render(<TestComponent />);
}

vi.mock("@/lib/colors/tailwind-colors", () => ({
  getRandomTailwindColor: vi.fn(() => "#000000"),
}));

test("returns initial state", () => {
  const { result } = renderHook(() => useMidi());

  expect(result.current.midiTracks).toBeUndefined();
  expect(typeof result.current.setMidiFile).toBe("function");
});

test("loads midiTracks from local storage", () => {
  localStorage.setItem("mivi:midi-tracks", JSON.stringify(expectedMidiTracks));
  const { result } = renderHook(() => useMidi());

  expect(result.current.midiTracks).toEqual(expectedMidiTracks);
});

test("loads and processes MIDI file", async () => {
  const { result } = renderHook(() => useMidi());

  await act(async () => {
    await result.current.setMidiFile(midiFile);
  });

  const { instanceKey, ...rest } = result.current.midiTracks!;
  const { instanceKey: _, ...expectedRest } = expectedMidiTracks;
  expect(rest).toEqual(expectedRest);
  expect(typeof instanceKey).toBe("string");
  expect(instanceKey.length).toBeGreaterThan(0);
});

test("sets midiTracks to undefined when setMidiFile is called with undefined", async () => {
  const { result } = renderHook(() => useMidi());

  await act(async () => {
    await result.current.setMidiFile(undefined);
  });
  expect(result.current.midiTracks).toBeUndefined();
});

test("handles MIDI file loading errors", async () => {
  const { result } = renderHook(() => useMidi());

  const mockMidiFile = new File(["invalid midi data"], "test.mid", {
    type: "audio/midi",
  });

  await act(async () => {
    await expect(result.current.setMidiFile(mockMidiFile)).rejects.toThrow();
  });
  expect(result.current.midiTracks).toBeUndefined();
});

test("setMidiTracks updates midiTracks", () => {
  const { result } = renderHook(() => useMidi());

  act(() => {
    result.current.setMidiTracks(expectedMidiTracks);
  });

  const newMidiTracks: MidiTracks = {
    ...expectedMidiTracks,
    tracks: expectedMidiTracks.tracks.map((track) => ({
      ...track,
      config: {
        ...track.config,
        color: "#ffffff",
      },
    })),
  };

  act(() => {
    result.current.setMidiTracks(newMidiTracks);
  });
  expect(result.current.midiTracks).toEqual(newMidiTracks);
});

test("shows confirm dialog when loading the same file", async () => {
  renderTestComponent();

  const loadButton = screen.getByTestId("load-midi");

  // Load the file first time
  await userEvent.click(loadButton);
  expect(await screen.findByTestId("midi-loaded")).toHaveTextContent("loaded");

  // Load the same file again - dialog should appear
  await userEvent.click(loadButton);

  expect(await screen.findByText("Same file detected")).toBeInTheDocument();
  expect(
    screen.getByText(/The same MIDI file is already loaded/),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Overwrite" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
});

test("clicking Overwrite reloads the MIDI file with new instanceKey", async () => {
  renderTestComponent();

  const loadButton = screen.getByTestId("load-midi");

  // Load file first time
  await userEvent.click(loadButton);
  await screen.findByTestId("midi-loaded");

  // Store the instanceKey from first load
  const originalInstanceKey = screen.getByTestId("instance-key").textContent;

  // Load same file again
  await userEvent.click(loadButton);

  // Wait for dialog and click Overwrite
  await screen.findByText("Same file detected");
  await userEvent.click(screen.getByRole("button", { name: "Overwrite" }));

  // Verify new instanceKey is generated
  const updatedInstanceKey = screen.getByTestId("instance-key").textContent;
  expect(updatedInstanceKey).not.toBe(originalInstanceKey);
});

test("clicking Keep preserves the current MIDI state", async () => {
  render(<TestComponent />);

  const loadButton = screen.getByTestId("load-midi");

  // Load file first time
  await userEvent.click(loadButton);
  await screen.findByTestId("midi-loaded");

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
