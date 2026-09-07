import { testMidiTracks } from "tests/fixtures";
import { expect, test, vi } from "vitest";

import { FileStore, type FileDecoders } from "@/lib/file-store/file-store";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";

const decoders: FileDecoders = {
  midi: async () => testMidiTracks,
  audio: async () => ({
    channels: [new Int16Array(1)],
    sampleRate: 44100,
    length: 1,
    numberOfChannels: 1,
    duration: 1 / 44100,
  }),
  backgroundImage: async () => ({ width: 1, height: 1 }) as ImageBitmap,
};

function createStore() {
  const storage = new MemoryFileStorage();
  return { storage, store: new FileStore(storage, decoders) };
}

test("preload loads every slot", async () => {
  const { storage, store } = createStore();
  await storage.write("audio", new File(["a"], "a.mp3"));

  expect(store.slots.every((slot) => !slot.loaded)).toBe(true);

  await store.preload();

  expect(store.slots.every((slot) => slot.loaded)).toBe(true);
  expect(store.audio.getSnapshot().file?.name).toBe("a.mp3");
  expect(store.midi.getSnapshot().file).toBeUndefined();
  expect(store.backgroundImage.getSnapshot().file).toBeUndefined();
});

test("clear wipes the underlying storage", async () => {
  const { storage, store } = createStore();
  await storage.write("audio", new File(["a"], "a.mp3"));

  await store.clear();

  expect(await storage.read("audio")).toBeUndefined();
});

test("preload returns the same promise on every call", () => {
  const { store } = createStore();
  expect(store.preload()).toBe(store.preload());
});

test("preload keeps the rejected promise until reset", async () => {
  const { storage, store } = createStore();
  const read = vi.spyOn(storage, "read").mockRejectedValueOnce(new Error("boom"));
  const failed = store.preload();

  await expect(failed).rejects.toThrow("boom");
  expect(store.preload()).toBe(failed);

  read.mockRestore();
  store.reset();
  await store.preload();
  expect(store.slots.every((slot) => slot.loaded)).toBe(true);
});

test("preload after reset reloads only slots that have not been loaded", async () => {
  const { storage, store } = createStore();
  const original = storage.read.bind(storage);
  vi.spyOn(storage, "read").mockImplementation((key) =>
    key === "background-image" ? Promise.reject(new Error("boom")) : original(key),
  );
  await expect(store.preload()).rejects.toThrow("boom");
  expect(store.audio.loaded).toBe(true);

  store.reset();
  const read = vi.spyOn(storage, "read").mockImplementation(original).mockClear();
  await store.preload();

  expect(read).toHaveBeenCalledExactlyOnceWith("background-image");
  expect(store.backgroundImage.loaded).toBe(true);
});
