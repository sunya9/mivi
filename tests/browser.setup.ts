import "vitest-browser-react";
import { beforeEach } from "vitest";

beforeEach(async () => {
  // Clear localStorage
  localStorage.clear();

  // Clear all IndexedDB databases
  const databases = await indexedDB.databases();
  await Promise.all(
    databases
      .map((db) => db.name)
      .filter((name): name is string => typeof name === "string")
      .map(
        (name) =>
          new Promise<void>((resolve, reject) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () =>
              reject(
                req.error ||
                  new Error("Failed to delete database by unknown reason"),
              );
            req.onblocked = () => resolve();
          }),
      ),
  );
});
