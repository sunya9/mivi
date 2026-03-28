import { expect, test } from "vitest";
import { saveFile, fetchFile, fetchValue, dbName, storeName } from "@/lib/file-db/file-db";

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

test("should clear legacy data on version upgrade", async () => {
  const key = "legacy-key";
  const legacyFile = new File(["old"], "old.txt", { type: "text/plain" });

  // Simulate legacy DB (version 1) with raw File stored directly
  const legacyDb = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(new Error("Failed to open legacy DB"));
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = legacyDb.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(legacyFile, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save legacy data"));
    tx.oncomplete = () => legacyDb.close();
  });

  // Opening with version 2 (via fetchValue) should clear legacy data
  const result = await fetchValue(key);
  expect(result).toBeUndefined();
});
