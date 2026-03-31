import { test, expect } from "vitest";
import { decodeAudio } from "@/lib/audio/decode-audio.worker";
import { fetchFixtureAsFile } from "tests/util";

test("dummy", () => {
  expect(1).toBe(1);
});

test("decodes audio file and returns StoredAudioData", async () => {
  const audioFile = await fetchFixtureAsFile("./tests/fixtures/test.mp3", "test.mp3", "audio/mpeg");
  const result = await decodeAudio(audioFile);

  expect(result.length).toBe(217728);
  expect(result.numberOfChannels).toBe(2);
  expect(result.channels[0]).toBeInstanceOf(Float32Array);
  expect(result.channels[1]).toBeInstanceOf(Float32Array);
  expect(result.sampleRate).toBe(48000);
});

test("throws when file has no audio track", async () => {
  const audioFile = await fetchFixtureAsFile(
    "./tests/fixtures/empty.m4a",
    "empty.m4a",
    "audio/mpeg",
  );
  await expect(decodeAudio(audioFile)).rejects.toThrow("No audio track found in file");
});

test("throws when file is wrong format", async () => {
  const invalidFile = new File(["invalid data"], "test.mp3", { type: "audio/mpeg" });
  await expect(decodeAudio(invalidFile)).rejects.toThrow(
    "Input has an unsupported or unrecognizable format.",
  );
});
