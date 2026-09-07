import { audioFile, rendererConfig, testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import type { SerializedAudio } from "@/lib/audio/audio";
import { FileStore } from "@/lib/file-store/file-store";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { createMidiTracksStore } from "@/lib/midi/midi-tracks-store";
import { createRendererConfigStore } from "@/lib/renderers/renderer-config-store";
import { createVisualizerSources } from "@/lib/visualizer/visualizer-sources";

const serializedAudio: SerializedAudio = {
  channels: [new Int16Array(44100)],
  sampleRate: 44100,
  length: 44100,
  numberOfChannels: 1,
  duration: 1,
};

async function setup() {
  const bitmap = await createImageBitmap(new OffscreenCanvas(2, 2));
  const stores = {
    rendererConfigStore: createRendererConfigStore(),
    midiTracksStore: createMidiTracksStore(),
    fileStore: new FileStore(new MemoryFileStorage(), {
      midi: async () => testMidiTracks,
      audio: async () => serializedAudio,
      backgroundImage: async () => bitmap,
    }),
  };
  return { sources: createVisualizerSources(stores), stores, bitmap };
}

test("passes renderer config and midi tracks through", async () => {
  const { sources, stores } = await setup();
  expect(sources.rendererConfig).toBe(stores.rendererConfigStore);
  expect(sources.midiTracks).toBe(stores.midiTracksStore);

  stores.midiTracksStore.set(testMidiTracks);
  expect(sources.midiTracks.getSnapshot()).toBe(testMidiTracks);
});

test("exposes the decoded background bitmap", async () => {
  const { sources, stores, bitmap } = await setup();
  expect(sources.backgroundImage.getSnapshot()).toBeUndefined();

  await stores.fileStore.backgroundImage.setFile(audioFile);

  expect(sources.backgroundImage.getSnapshot()).toBe(bitmap);
});

test("exposes the decoded audio until the file is removed", async () => {
  const { sources, stores } = await setup();

  await stores.fileStore.audio.setFile(audioFile);
  expect(sources.serializedAudio.getSnapshot()).toBe(serializedAudio);

  stores.rendererConfigStore.set({ ...rendererConfig });
  expect(sources.serializedAudio.getSnapshot()).toBe(serializedAudio);

  await stores.fileStore.audio.setFile(undefined);
  expect(sources.serializedAudio.getSnapshot()).toBeUndefined();
});
