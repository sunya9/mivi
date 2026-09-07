import { midiFile, testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import { parseMidi } from "@/lib/midi/parse-midi";

test("parses a MIDI file into tracks with default configs", async () => {
  const { instanceKey, ...parsed } = await parseMidi(midiFile);
  const { instanceKey: _, ...expected } = testMidiTracks;

  expect(parsed).toEqual({
    ...expected,
    tracks: expected.tracks.map((track) => ({ ...track, id: expect.any(String) })),
  });
  expect(instanceKey).not.toBe("");
});

test("rejects data that is not a MIDI file", async () => {
  const invalid = new File(["invalid midi data"], "test.mid", { type: "audio/midi" });
  await expect(parseMidi(invalid)).rejects.toThrow("Bad MIDI file.");
});
