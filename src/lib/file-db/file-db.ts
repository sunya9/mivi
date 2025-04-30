export const storeName = "key-value";
export const dbName = "mivi:file";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
}

export async function fetchFile(key: string) {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(key);
  transaction.oncomplete = () => {
    db.close();
  };

  return new Promise<File | undefined>((resolve, reject) => {
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result as File);
      } else {
        resolve(undefined);
      }
    };
    request.onerror = () => {
      reject(new Error("Failed to fetch file"));
    };
  });
}

export async function saveFile(key: string, newFile: File | undefined) {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  transaction.oncomplete = () => {
    db.close();
  };

  let request: IDBRequest;
  if (!newFile) {
    request = store.delete(key);
  } else {
    request = store.put(newFile, key);
  }
  return new Promise<void>((resolve, reject) => {
    request.onerror = () => {
      const message = !newFile
        ? "Failed to delete file"
        : "Failed to save file";
      const error = new Error(message);
      reject(error);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}
