import { AppContext } from "@/contexts/app-context";
import { CacheProvider } from "@/lib/cache/cache-provider";
import { AppContextValue } from "@/lib/globals";
import { PwaContext, PwaState } from "@/pwa/pwa-update-context";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { createMockPwaState } from "./pwa-mock";

/**
 * Test wrapper that provides AppContext and PwaContext.
 */
export function TestProviders({
  children,
  appContextValue,
  pwaState = createMockPwaState(),
}: {
  children: React.ReactNode;
  appContextValue: AppContextValue;
  pwaState?: PwaState;
}) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <CacheProvider>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaState}>
            <Suspense fallback={null}>{children}</Suspense>
          </PwaContext>
        </AppContext>
      </CacheProvider>
    </ThemeProvider>
  );
}
