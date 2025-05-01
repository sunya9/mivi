import { fetchFile, saveFile } from "@/lib/file-db/file-db";
import { ContextType, use, useCallback, useState } from "react";
import { toast } from "sonner";
import { FilesContext } from "../../contexts/files-context";
import type { FileLike } from "@/lib/file-db";
function loadInitialFile(
  filesContext: ContextType<typeof FilesContext>,
  key: string,
) {
  if (filesContext.files.has(key)) {
    return filesContext.files.get(key);
  } else {
    throw fetchFile(key).then((file) => {
      filesContext.setFile(key, file);
      return file;
    });
  }
}

export function useIndexedDb(key: string) {
  const filesContext = use(FilesContext);
  const [file, setFileInternal] = useState<FileLike | undefined>(() =>
    loadInitialFile(filesContext, key),
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
