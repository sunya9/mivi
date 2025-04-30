import { createContext } from "react";

export const FilesContext = createContext<{
  files: Map<string, File | undefined>;
  setFile: (key: string, file: File | undefined) => void;
}>({
  files: new Map(),
  setFile: () => {},
});
