import { Suspense } from "react";

import { FileDbGate, FileDbStoreProvider } from "@/components/providers/file-db-store-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppContext, AppContextValue } from "@/contexts/app-context";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
import { FileDbStore, FileDbStoreContext } from "@/lib/file-db/file-db-store";

import { createMockPwaState } from "./pwa-mock";

/**
 * Test wrapper that provides AppContext and PwaContext.
 */
export function TestProviders({
  children,
  appContextValue,
  fileDbStore,
  pwaState = createMockPwaState(),
}: {
  children: React.ReactNode;
  appContextValue: AppContextValue;
  fileDbStore?: FileDbStore;
  pwaState?: PwaState;
}) {
  const app = (
    <AppContext value={appContextValue}>
      <PwaContext value={pwaState}>
        <Suspense fallback={null}>
          <FileDbGate>{children}</FileDbGate>
        </Suspense>
      </PwaContext>
    </AppContext>
  );
  return (
    <ThemeProvider defaultTheme="light">
      {fileDbStore ? (
        <FileDbStoreContext value={fileDbStore}>{app}</FileDbStoreContext>
      ) : (
        <FileDbStoreProvider>{app}</FileDbStoreProvider>
      )}
    </ThemeProvider>
  );
}
