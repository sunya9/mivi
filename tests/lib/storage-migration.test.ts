import { expect, test } from "vitest";

import { purgeLegacyStorage } from "@/lib/storage-migration";

function openDatabase(name: string) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("key-value");
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error ?? new Error("open failed"));
  });
}

test("removes the legacy IndexedDB cache and MIDI state", async () => {
  await openDatabase("mivi:file");
  localStorage.setItem("mivi:midi-tracks", "{}");
  localStorage.setItem("mivi:midi-settings", "{}");

  await purgeLegacyStorage();

  expect((await indexedDB.databases()).map((db) => db.name)).toEqual([]);
  expect(localStorage.getItem("mivi:midi-tracks")).toBeNull();
  expect(localStorage.getItem("mivi:midi-settings")).toBe("{}");
});
