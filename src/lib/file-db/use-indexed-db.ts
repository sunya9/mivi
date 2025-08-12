import { fetchFile, saveFile } from "@/lib/file-db";
import { ContextType, use, useCallback, useState } from "react";
import { toast } from "sonner";
import { CacheContext } from "../../contexts/cache-context";

function loadInitialFile(
  cacheContext: ContextType<typeof CacheContext>,
  key: string,
) {
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
  const cacheContext = use(CacheContext);
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
        console.error("Failed to save file", error);
        toast.error("Failed to save file");
      }
    },
    [key],
  );
  return { file, setFile };
}
