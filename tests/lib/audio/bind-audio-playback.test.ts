import { AudioContext } from "standardized-audio-context-mock";
import { audioFile } from "tests/fixtures";
import { expect, test } from "vitest";

import type { SerializedAudio } from "@/lib/audio/audio";
import { bindAudioToPlayback } from "@/lib/audio/bind-audio-playback";
import { floatToInt16 } from "@/lib/audio/pcm";
import { FileSlot } from "@/lib/file-store/file-slot";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { AudioPlaybackStoreImpl } from "@/lib/player/audio-playback-store";

const audioContext = new AudioContext();
const sourceBuffer = audioContext.createBuffer(2, 44100, 44100);
const serializedAudio: SerializedAudio = {
  channels: [0, 1].map((i) => floatToInt16(sourceBuffer.getChannelData(i))),
  sampleRate: 44100,
  length: 44100,
  numberOfChannels: 2,
  duration: 1,
};

function createSlot() {
  return new FileSlot<SerializedAudio>({
    key: "audio",
    label: "audio file",
    storage: new MemoryFileStorage(),
    decode: async () => serializedAudio,
  });
}

function setup() {
  const audioSlot = createSlot();
  const playback = new AudioPlaybackStoreImpl(audioContext);
  const unbind = bindAudioToPlayback(audioSlot, playback, audioContext);
  return { audioSlot, playback, unbind };
}

test("pushes an already decoded file into the playback store on bind", async () => {
  const audioSlot = createSlot();
  await audioSlot.setFile(audioFile);
  const playback = new AudioPlaybackStoreImpl(audioContext);

  bindAudioToPlayback(audioSlot, playback, audioContext);

  expect(playback.getSnapshot().duration).toBe(1);
});

test("follows file changes, including removal", async () => {
  const { audioSlot, playback } = setup();
  expect(playback.getSnapshot().duration).toBe(0);

  await audioSlot.setFile(audioFile);
  expect(playback.getSnapshot().duration).toBe(1);

  await audioSlot.setFile(undefined);
  expect(playback.getSnapshot().duration).toBe(0);
});

test("stops following after unbind", async () => {
  const { audioSlot, playback, unbind } = setup();

  unbind();
  await audioSlot.setFile(audioFile);

  expect(playback.getSnapshot().duration).toBe(0);
});
