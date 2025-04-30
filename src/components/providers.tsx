import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "./app-context";
import { appContextValue } from "../lib/app-context-value";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { TooltipProvider } from "./ui/tooltip";
import { FilesProvider } from "./files-provider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <TooltipProvider>
        <FilesProvider>
          <AppContext value={appContextValue}>
            <ErrorBoundary fallbackRender={Fallback}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ErrorBoundary>
          </AppContext>
        </FilesProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
