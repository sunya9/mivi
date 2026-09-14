import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HotkeysProvider } from "react-hotkeys-hook";

import { AppContext, type AppContextValue } from "@/contexts/app-context";
import { PwaContext } from "@/contexts/pwa-context";
import { FileStoreContext } from "@/lib/file-store/use-file-store";
import { PLAYER_HOTKEYS_SCOPE } from "@/lib/hotkeys";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

import { Fallback } from "./fallback";
import { FileStoreGate } from "./file-store-gate";
import { Loading } from "./loading";

interface ProvidersProps {
  appContextValue: AppContextValue;
  children: React.ReactNode;
}

export function Providers({ appContextValue, children }: ProvidersProps) {
  const { fileStore } = appContextValue;
  const pwaUpdateState = usePwaState();

  return (
    <FileStoreContext value={fileStore}>
      <AppContext value={appContextValue}>
        <PwaContext value={pwaUpdateState}>
          <HotkeysProvider initiallyActiveScopes={[PLAYER_HOTKEYS_SCOPE]}>
            <ErrorBoundary fallbackRender={Fallback} onReset={fileStore.reset}>
              <Suspense fallback={<Loading />}>
                <FileStoreGate>{children}</FileStoreGate>
              </Suspense>
            </ErrorBoundary>
          </HotkeysProvider>
        </PwaContext>
      </AppContext>
    </FileStoreContext>
  );
}
