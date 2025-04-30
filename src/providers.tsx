import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "./app-context";
import { appContextValue } from "./lib/app-context-value";
import { Fallback } from "./components/fallback";
import { Loading } from "./components/loading";
import { TooltipProvider } from "./components/ui/tooltip";
import { FilesProvider } from "./components/files-provider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <FilesProvider>
        <AppContext value={appContextValue}>
          <ErrorBoundary fallbackRender={Fallback}>
            <Suspense fallback={<Loading />}>
              <TooltipProvider>{children}</TooltipProvider>
            </Suspense>
          </ErrorBoundary>
        </AppContext>
      </FilesProvider>
    </ThemeProvider>
  );
}
