import { FileLike } from "@/lib/file-db";
import { createContext } from "react";

export const FilesContext = createContext<{
  files: Map<string, FileLike | undefined>;
  setFile: (key: string, file: FileLike | undefined) => void;
}>({
  files: new Map(),
  setFile: () => {},
});
