import { fetchFile, saveFile } from "@/lib/file-db/file-db";
import { useCallback, useState } from "react";
import { CacheContextValue, useCacheContext } from "../cache/cache-context";
import { errorLogWithToast } from "../utils";

function loadInitialFile(cacheContext: CacheContextValue, key: string) {
  if (cacheContext.caches.has(key)) {
    return cacheContext.caches.get(key) as File | undefined;
  } else {
    throw fetchFile(key).then((file) => {
      cacheContext.setCache(key, file);
      return file;
    });
  }
}

export function useIndexedDb(key: string) {
  const cacheContext = useCacheContext();
  const [file, setFileInternal] = useState<File | undefined>(() =>
    loadInitialFile(cacheContext, key),
  );
  const setFile = useCallback(
    async (newFile: File | undefined) => {
      try {
        setFileInternal(newFile);
        // optimistic update
        await saveFile(key, newFile);
      } catch (error) {
        errorLogWithToast("Failed to save file", error);
      }
    },
    [key],
  );
  return { file, setFile };
}
