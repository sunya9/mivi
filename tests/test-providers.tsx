import { Suspense, useState } from "react";

import { FileDbGate } from "@/components/providers/file-db-gate";
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
  const [ownFileDbStore] = useState(() => new FileDbStore());
  return (
    <ThemeProvider defaultTheme="light">
      <FileDbStoreContext value={fileDbStore ?? ownFileDbStore}>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaState}>
            <Suspense fallback={null}>
              <FileDbGate>{children}</FileDbGate>
            </Suspense>
          </PwaContext>
        </AppContext>
      </FileDbStoreContext>
    </ThemeProvider>
  );
}
