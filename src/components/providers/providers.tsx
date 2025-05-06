import { Suspense, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "../../contexts/app-context";
import { appContextValue } from "../../lib/globals";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { TooltipProvider } from "../ui/tooltip";
import { ThemeProvider } from "next-themes";
import { CacheContext } from "@/contexts/cache-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [caches, setCaches] = useState<Map<string, unknown>>(new Map());
  const setCache = useCallback((key: string, cache: unknown) => {
    setCaches((prev) => {
      const newCaches = new Map(prev);
      newCaches.set(key, cache);
      return newCaches;
    });
  }, []);
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <TooltipProvider>
        <CacheContext value={{ caches, setCache }}>
          <AppContext value={appContextValue}>
            <ErrorBoundary fallbackRender={Fallback}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ErrorBoundary>
          </AppContext>
        </CacheContext>
      </TooltipProvider>
    </ThemeProvider>
  );
}
