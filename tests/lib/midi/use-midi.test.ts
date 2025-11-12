import { test, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMidi } from "@/lib/midi/use-midi";
import { expectedMidiTracks, midiFile } from "tests/fixtures";
import { MidiTracks } from "@/lib/midi/midi";

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

  expect(result.current.midiTracks).toEqual(expectedMidiTracks);
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
