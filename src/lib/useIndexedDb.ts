import { fetchFile, saveFile } from "@/lib/fileDb";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const files = new Map<string, File | undefined>();

const loadInitialFile = (key: string) => {
  if (files.has(key)) {
    return files.get(key);
  } else {
    throw fetchFile(key).then((file) => {
      files.set(key, file);
      return file;
    });
  }
};

export const useIndexedDb = (key: string) => {
  const [file, setFileInternal] = useState<File | undefined>(() =>
    loadInitialFile(key),
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
};
