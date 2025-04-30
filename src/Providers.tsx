import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "./AppContext";
import { appContextValue } from "./lib/appContextValue";
import { Fallback } from "./components/Fallback";
import { Loading } from "./components/Loading";
import { TooltipProvider } from "./components/ui/tooltip";
import { FilesProvider } from "./components/FilesProvider";
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
