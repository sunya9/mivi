import { expect, test } from "vitest";

import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";

const file = new File(["a"], "a.mp3", { type: "audio/mpeg" });

test("returns undefined for a missing key", async () => {
  const storage = new MemoryFileStorage();
  expect(await storage.read("audio")).toBeUndefined();
});

test("round-trips a written file", async () => {
  const storage = new MemoryFileStorage();
  await storage.write("audio", file);
  expect(await storage.read("audio")).toBe(file);
});

test("remove and clear drop stored files", async () => {
  const storage = new MemoryFileStorage();
  await storage.write("audio", file);
  await storage.write("midi", file);

  await storage.remove("audio");
  expect(await storage.read("audio")).toBeUndefined();
  expect(await storage.read("midi")).toBe(file);

  await storage.clear();
  expect(await storage.read("midi")).toBeUndefined();
});
