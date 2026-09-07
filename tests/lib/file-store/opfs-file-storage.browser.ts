import { expect, test } from "vitest";

import { OpfsFileStorage } from "@/lib/file-store/opfs-file-storage";

const file = new File(["hello"], "hello.txt", { type: "text/plain", lastModified: 1234 });

test("returns undefined for a missing key", async () => {
  const storage = new OpfsFileStorage();
  expect(await storage.read("missing")).toBeUndefined();
});

test("round-trips a file with its name, type and lastModified", async () => {
  const storage = new OpfsFileStorage();
  await storage.write("audio", file);

  const restored = await new OpfsFileStorage().read("audio");
  expect(restored?.name).toBe("hello.txt");
  expect(restored?.type).toBe("text/plain");
  expect(restored?.lastModified).toBe(1234);
  expect(await restored?.text()).toBe("hello");
});

test("overwrites an existing key", async () => {
  const storage = new OpfsFileStorage();
  await storage.write("audio", file);
  await storage.write("audio", new File(["hi"], "hi.txt", { type: "text/plain" }));

  const restored = await storage.read("audio");
  expect(restored?.name).toBe("hi.txt");
  expect(await restored?.text()).toBe("hi");
});

test("remove and clear drop stored files", async () => {
  const storage = new OpfsFileStorage();
  await storage.write("audio", file);
  await storage.write("midi", file);

  await storage.remove("audio");
  await storage.remove("audio");
  expect(await storage.read("audio")).toBeUndefined();
  expect((await storage.read("midi"))?.name).toBe("hello.txt");

  await storage.clear();
  expect(await storage.read("midi")).toBeUndefined();
  await storage.clear();
});
