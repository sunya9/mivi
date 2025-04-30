import { FilesContext } from "@/lib/files-context";
import { useCallback, useState } from "react";

export function FilesProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<Map<string, File | undefined>>(new Map());
  const setFile = useCallback((key: string, file: File | undefined) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      newFiles.set(key, file);
      return newFiles;
    });
  }, []);
  return <FilesContext value={{ files, setFile }}>{children}</FilesContext>;
}
