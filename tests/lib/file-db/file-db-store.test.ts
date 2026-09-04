import { expect, test, vi } from "vitest";

import * as fileDb from "@/lib/file-db/file-db";
import { saveValue } from "@/lib/file-db/file-db";
import { FileDbStore } from "@/lib/file-db/file-db-store";

test("preload loads both slots", async () => {
  await saveValue("db:audio", {
    file: new File(["a"], "a.mp3"),
    decoded: { channels: [new Int16Array(1)], sampleRate: 44100, length: 1, numberOfChannels: 1 },
  });
  const store = new FileDbStore();

  expect(store.audio.loaded).toBe(false);
  expect(store.backgroundImage.loaded).toBe(false);

  await store.preload();

  expect(store.audio.loaded).toBe(true);
  expect(store.audio.data?.file.name).toBe("a.mp3");
  expect(store.backgroundImage.loaded).toBe(true);
  expect(store.backgroundImage.data).toBeUndefined();
});

test("preload returns the same promise on every call", () => {
  const store = new FileDbStore();
  expect(store.preload()).toBe(store.preload());
});

test("preload rejects when a slot fails to load", async () => {
  const store = new FileDbStore();
  vi.spyOn(store.audio, "load").mockRejectedValue(new Error("boom"));

  await expect(store.preload()).rejects.toThrow("boom");
});

test("load returns the same promise while pending", async () => {
  const store = new FileDbStore();
  const first = store.audio.load();

  expect(store.audio.load()).toBe(first);
  await first;
  expect(store.audio.loaded).toBe(true);
});

test("load keeps the rejected promise until reset so that use() can surface the error", async () => {
  const store = new FileDbStore();
  const fetchValue = vi.spyOn(fileDb, "fetchValue").mockRejectedValueOnce(new Error("boom"));
  const failed = store.audio.load();

  await expect(failed).rejects.toThrow("boom");
  expect(store.audio.load()).toBe(failed);

  fetchValue.mockRestore();
  store.reset();
  await store.audio.load();
  expect(store.audio.loaded).toBe(true);
});

test("preload keeps the rejected promise until reset", async () => {
  const store = new FileDbStore();
  const fetchValue = vi.spyOn(fileDb, "fetchValue").mockRejectedValueOnce(new Error("boom"));
  const failed = store.preload();

  await expect(failed).rejects.toThrow("boom");
  expect(store.preload()).toBe(failed);

  fetchValue.mockRestore();
  store.reset();
  await store.preload();
  expect(store.audio.loaded).toBe(true);
  expect(store.backgroundImage.loaded).toBe(true);
});

test("reset keeps already loaded data", async () => {
  await saveValue("db:audio", {
    file: new File(["a"], "a.mp3"),
    decoded: { channels: [new Int16Array(1)], sampleRate: 44100, length: 1, numberOfChannels: 1 },
  });
  const store = new FileDbStore();
  await store.preload();

  store.reset();

  expect(store.audio.loaded).toBe(true);
  expect(store.audio.data?.file.name).toBe("a.mp3");
});
