import { Suspense } from "react";
import { HotkeysProvider } from "react-hotkeys-hook";

import { FileStoreGate } from "@/components/providers/file-store-gate";
import { AppContext, AppContextValue } from "@/contexts/app-context";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
import { FileStoreContext } from "@/lib/file-store/use-file-store";
import { PLAYER_HOTKEYS_SCOPE } from "@/lib/hotkeys";

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
          <HotkeysProvider initiallyActiveScopes={[PLAYER_HOTKEYS_SCOPE]}>
            <Suspense fallback={null}>
              <FileStoreGate>{children}</FileStoreGate>
            </Suspense>
          </HotkeysProvider>
        </PwaContext>
      </AppContext>
    </FileStoreContext>
  );
}
