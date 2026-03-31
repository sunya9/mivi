export const storeName = "key-value";
export const dbName = "mivi:file";

let cachedDb: IDBDatabase | null = null;

/** Close and release the cached DB connection. */
export function closeDb() {
  cachedDb?.close();
  cachedDb = null;
}

function openDB(): Promise<IDBDatabase> {
  if (cachedDb) return Promise.resolve(cachedDb);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(storeName)) {
        // Clear old data on version upgrade (cache-only, safe to discard)
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        tx.objectStore(storeName).clear();
      } else {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      cachedDb = db;

      resolve(db);
    };
  });
}

export async function fetchValue<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(key);

  return new Promise<T | undefined>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };
    request.onerror = () => {
      reject(new Error("Failed to fetch value"));
    };
  });
}

export async function saveValue<T>(key: string, value: T | undefined): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  const request = value === undefined ? store.delete(key) : store.put(value, key);
  return new Promise<void>((resolve, reject) => {
    request.onerror = () => {
      reject(new Error("Failed to save value"));
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}
