import { expect, test, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { FileSlot, type FileDecoder } from "@/lib/file-store/file-slot";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";

const file = new File(["a"], "a.txt", { type: "text/plain" });
const other = new File(["b"], "b.txt", { type: "text/plain" });

function deferredDecoder() {
  const pending: { resolve: (value: string) => void; reject: (error: unknown) => void }[] = [];
  const decode = vi.fn<FileDecoder<string>>(
    (_file, signal) =>
      new Promise<string>((resolve, reject) => {
        pending.push({ resolve, reject });
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );
  return { decode, pending };
}

function createSlot(decode: FileDecoder<string> = async (f) => `decoded:${f.name}`) {
  const storage = new MemoryFileStorage();
  const slot = new FileSlot({ key: "slot", label: "test file", storage, decode });
  return { slot, storage };
}

test("starts empty and not loaded", () => {
  const { slot } = createSlot();
  expect(slot.loaded).toBe(false);
  expect(slot.getSnapshot()).toEqual({ file: undefined, decoded: undefined, decoding: false });
});

test("load without a stored file marks the slot loaded and empty", async () => {
  const { slot } = createSlot();
  await slot.load();
  expect(slot.loaded).toBe(true);
  expect(slot.getSnapshot()).toEqual({ file: undefined, decoded: undefined, decoding: false });
});

test("load exposes the stored file immediately and decodes it in the background", async () => {
  const { decode, pending } = deferredDecoder();
  const { slot, storage } = createSlot(decode);
  await storage.write("slot", file);

  await slot.load();
  expect(slot.getSnapshot()).toEqual({ file, decoded: undefined, decoding: true });

  pending[0].resolve("decoded");
  await vi.waitFor(() =>
    expect(slot.getSnapshot()).toEqual({ file, decoded: "decoded", decoding: false }),
  );
});

test("load returns the same promise while pending and resolves once loaded", async () => {
  const { slot } = createSlot();
  const first = slot.load();
  expect(slot.load()).toBe(first);
  await first;
  expect(slot.load()).not.toBe(first);
});

test("load keeps the rejected promise until reset so that use() can surface the error", async () => {
  const { slot, storage } = createSlot();
  const read = vi.spyOn(storage, "read").mockRejectedValueOnce(new Error("boom"));
  const failed = slot.load();

  await expect(failed).rejects.toThrow("boom");
  expect(slot.load()).toBe(failed);

  read.mockRestore();
  slot.reset();
  await slot.load();
  expect(slot.loaded).toBe(true);
});

test("reset keeps an already loaded slot loaded", async () => {
  const { slot } = createSlot();
  await slot.load();
  slot.reset();
  expect(slot.loaded).toBe(true);
});

test("a stored file that fails to decode is dropped from storage", async () => {
  const { slot, storage } = createSlot(async () => {
    throw new Error("corrupt");
  });
  await storage.write("slot", file);

  await slot.load();
  await vi.waitFor(() => expect(slot.getSnapshot().decoding).toBe(false));

  expect(slot.getSnapshot()).toEqual({ file: undefined, decoded: undefined, decoding: false });
  expect(await storage.read("slot")).toBeUndefined();
  expect(toast.add).toHaveBeenCalledWith({
    title: "Failed to load test file",
    description: "corrupt",
    type: "error",
  });
});

test("cancelling the background decode of a stored file clears the slot", async () => {
  const { decode } = deferredDecoder();
  const { slot, storage } = createSlot(decode);
  await storage.write("slot", file);
  await slot.load();

  slot.cancel();

  expect(slot.getSnapshot()).toEqual({ file: undefined, decoded: undefined, decoding: false });
  await vi.waitFor(async () => expect(await storage.read("slot")).toBeUndefined());
});

test("setFile decodes, publishes and persists the file", async () => {
  const { slot, storage } = createSlot();

  await expect(slot.setFile(file)).resolves.toBe(true);

  expect(slot.getSnapshot()).toEqual({ file, decoded: "decoded:a.txt", decoding: false });
  expect(await storage.read("slot")).toBe(file);
});

test("setFile keeps the previous entry visible while decoding", async () => {
  const { decode, pending } = deferredDecoder();
  const { slot } = createSlot(decode);
  const first = slot.setFile(file);
  pending[0].resolve("first");
  await first;

  const second = slot.setFile(other);
  expect(slot.getSnapshot()).toEqual({ file, decoded: "first", decoding: true });

  pending[1].resolve("second");
  await expect(second).resolves.toBe(true);
  expect(slot.getSnapshot()).toEqual({ file: other, decoded: "second", decoding: false });
});

test("setFile with undefined clears the slot and storage", async () => {
  const { slot, storage } = createSlot();
  await slot.setFile(file);

  await expect(slot.setFile(undefined)).resolves.toBe(true);

  expect(slot.getSnapshot()).toEqual({ file: undefined, decoded: undefined, decoding: false });
  expect(await storage.read("slot")).toBeUndefined();
});

test("cancel aborts the decode and restores the previous entry", async () => {
  const { decode, pending } = deferredDecoder();
  const { slot, storage } = createSlot(decode);
  const first = slot.setFile(file);
  pending[0].resolve("first");
  await first;

  const second = slot.setFile(other);
  slot.cancel();

  await expect(second).resolves.toBe(false);
  expect(decode.mock.calls[1][1].aborted).toBe(true);
  expect(slot.getSnapshot()).toEqual({ file, decoded: "first", decoding: false });
  expect(await storage.read("slot")).toBe(file);

  pending[1].resolve("late");
  await Promise.resolve();
  expect(slot.getSnapshot().decoded).toBe("first");
});

test("cancel without an in-flight decode is a no-op", () => {
  const { slot } = createSlot();
  slot.cancel();
  expect(slot.getSnapshot().decoding).toBe(false);
});

test("a second setFile supersedes the first", async () => {
  const { decode, pending } = deferredDecoder();
  const { slot } = createSlot(decode);

  const first = slot.setFile(file);
  const second = slot.setFile(other);
  expect(decode.mock.calls[0][1].aborted).toBe(true);

  pending[1].resolve("second");
  await expect(second).resolves.toBe(true);
  await expect(first).resolves.toBe(false);
  expect(slot.getSnapshot()).toEqual({ file: other, decoded: "second", decoding: false });
});

test("a failed decode reports the error and keeps the previous entry", async () => {
  const error = new Error("bad file");
  const decode = vi
    .fn<FileDecoder<string>>()
    .mockResolvedValueOnce("first")
    .mockRejectedValueOnce(error);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const { slot, storage } = createSlot(decode);
  await slot.setFile(file);

  await expect(slot.setFile(other)).resolves.toBe(false);

  expect(slot.getSnapshot()).toEqual({ file, decoded: "first", decoding: false });
  expect(await storage.read("slot")).toBe(file);
  expect(consoleError).toHaveBeenCalledWith("Failed to load test file", error);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Failed to load test file",
    description: "bad file",
    type: "error",
  });
});

test("a failed write keeps the decoded entry and reports the error", async () => {
  const error = new Error("quota");
  const { slot, storage } = createSlot();
  vi.spyOn(storage, "write").mockRejectedValueOnce(error);
  vi.spyOn(console, "error").mockImplementation(() => {});

  await expect(slot.setFile(file)).resolves.toBe(true);

  expect(slot.getSnapshot().decoded).toBe("decoded:a.txt");
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Failed to save file",
    description: "quota",
    type: "error",
  });
});
