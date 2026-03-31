import { expect, test } from "vitest";
import { saveValue, fetchValue, dbName, storeName } from "@/lib/file-db/file-db";

test("should save and fetch a value", async () => {
  await saveValue("key", { name: "test", count: 42 });
  const result = await fetchValue<{ name: string; count: number }>("key");
  expect(result).toEqual({ name: "test", count: 42 });
});

test("should return undefined for non-existent key", async () => {
  const result = await fetchValue("non-existent");
  expect(result).toBeUndefined();
});

test("should delete value when saving undefined", async () => {
  await saveValue("to-delete", "hello");
  expect(await fetchValue("to-delete")).toBe("hello");

  await saveValue("to-delete", undefined);
  expect(await fetchValue("to-delete")).toBeUndefined();
});

test("should overwrite existing value", async () => {
  await saveValue("overwrite", "first");
  await saveValue("overwrite", "second");
  expect(await fetchValue("overwrite")).toBe("second");
});

test("should clear legacy data on version upgrade", async () => {
  const key = "legacy-key";

  // Simulate legacy DB (version 1) with data stored directly
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
    const request = store.put("legacy-data", key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save legacy data"));
    tx.oncomplete = () => legacyDb.close();
  });

  // Opening with version 2 (via fetchValue) should clear legacy data
  const result = await fetchValue(key);
  expect(result).toBeUndefined();
});
