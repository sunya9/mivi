import { useCallback, useEffect, useState } from "react";

const storeName = "key-value";
const dbName = "mivi:file";

export const useIndexedDb = (key: string) => {
  const [file, setFileInternal] = useState<File>();
  const [error, setError] = useState<string>();

  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => {
        setError("Failed to open database");
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
  }, []);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const db = await openDB();
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            setFileInternal(request.result);
          } else {
            setFileInternal(undefined);
          }
        };

        request.onerror = () => {
          setError("Failed to fetch file");
        };

        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      }
    };

    fetchFile();
  }, [key, openDB]);

  const setFile = useCallback(
    async (newFile: File | undefined) => {
      try {
        const db = await openDB();
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        let request: IDBRequest;

        if (!newFile) {
          request = store.delete(key);
        } else {
          request = store.put(newFile, key);
        }

        request.onsuccess = () => {
          setFileInternal(newFile);
        };

        request.onerror = () => {
          setError(!newFile ? "Failed to delete file" : "Failed to save file");
        };

        transaction.oncomplete = () => {
          db.close();
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      }
    },
    [key, openDB],
  );

  return { file, setFile, error };
};
