import { Suspense, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "../../contexts/app-context";
import { appContextValue } from "../../lib/globals";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { TooltipProvider } from "../ui/tooltip";
import { ThemeProvider } from "next-themes";
import { FilesContext } from "@/contexts/files-context";
import { FileLike } from "@/lib/file-db";

export function Providers({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<Map<string, FileLike | undefined>>(
    new Map(),
  );
  const setFile = useCallback((key: string, file: FileLike | undefined) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      newFiles.set(key, file);
      return newFiles;
    });
  }, []);
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <TooltipProvider>
        <FilesContext value={{ files, setFile }}>
          <AppContext value={appContextValue}>
            <ErrorBoundary fallbackRender={Fallback}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ErrorBoundary>
          </AppContext>
        </FilesContext>
      </TooltipProvider>
    </ThemeProvider>
  );
}
