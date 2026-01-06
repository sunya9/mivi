import { expect, test } from "vitest";
import { saveFile, fetchFile } from "@/lib/file-db/file-db";

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

test("should delete file when saveFile is called with undefined", async () => {
  const key = "delete-test-key";
  const file = new File(["test content"], "test.txt", { type: "text/plain" });

  await saveFile(key, file);
  const saved = await fetchFile(key);
  expect(saved?.name).toEqual(file.name);

  await saveFile(key, undefined);
  const deleted = await fetchFile(key);
  expect(deleted).toBeUndefined();
});
