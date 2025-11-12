import { expect, test, vi, beforeEach } from "vitest";
import { saveFile, fetchFile } from "@/lib/file-db/file-db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("should save and fetch file successfully", async () => {
  const key = "test-key";
  const file = new File(["test content"], "test.txt", { type: "text/plain" });

  await saveFile(key, file);
  const result = await fetchFile(key);
  expect(result?.name).toEqual(file.name);
});

test("return empty if file not found", async () => {
  const key = "test-key";
  const result = await fetchFile(key);
  expect(result).toBeUndefined();
});
