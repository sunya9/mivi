import { Suspense } from "react";

import { FileStoreGate } from "@/components/providers/file-store-gate";
import { AppContext, AppContextValue } from "@/contexts/app-context";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
import { FileStoreContext } from "@/lib/file-store/use-file-store";

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
    <FileStoreContext value={appContextValue.fileStore}>
      <AppContext value={appContextValue}>
        <PwaContext value={pwaState}>
          <Suspense fallback={null}>
            <FileStoreGate>{children}</FileStoreGate>
          </Suspense>
        </PwaContext>
      </AppContext>
    </FileStoreContext>
  );
}
