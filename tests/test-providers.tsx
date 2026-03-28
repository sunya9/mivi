import { AppContext, AppContextValue } from "@/contexts/app-context";
import { FileDbStoreProvider } from "@/components/providers/file-db-store-provider";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
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
    <ThemeProvider themes={["light", "dark"]} defaultTheme="light" attribute="class">
      <FileDbStoreProvider>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaState}>
            <Suspense fallback={null}>{children}</Suspense>
          </PwaContext>
        </AppContext>
      </FileDbStoreProvider>
    </ThemeProvider>
  );
}
