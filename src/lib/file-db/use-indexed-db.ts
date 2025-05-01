import { fetchFile, saveFile } from "@/lib/file-db/file-db";
import { ContextType, use, useCallback, useState } from "react";
import { toast } from "sonner";
import { CacheContext } from "../../contexts/files-context";
import type { FileLike } from "@/lib/file-db";
function loadInitialFile(
  cacheContext: ContextType<typeof CacheContext>,
  key: string,
) {
  if (cacheContext.caches.has(key)) {
    return cacheContext.caches.get(key) as FileLike | undefined;
  } else {
    throw fetchFile(key).then((file) => {
      cacheContext.setCache(key, file);
      return file;
    });
  }
}

export function useIndexedDb(key: string) {
  const cacheContext = use(CacheContext);
  const [file, setFileInternal] = useState<FileLike | undefined>(() =>
    loadInitialFile(cacheContext, key),
  );
  const setFile = useCallback(
    async (newFile: FileLike | undefined) => {
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
