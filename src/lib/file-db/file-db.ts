export const storeName = "key-value";
export const dbName = "mivi:file";

function openDB(): Promise<IDBDatabase> {
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
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
}

export async function fetchValue<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(key);
  transaction.oncomplete = () => {
    db.close();
  };

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
  transaction.oncomplete = () => {
    db.close();
  };

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

// Legacy aliases for existing tests
export const fetchFile = fetchValue<File>;
export const saveFile = saveValue<File>;
