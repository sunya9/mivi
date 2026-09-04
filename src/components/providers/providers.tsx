import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AudioContext } from "standardized-audio-context";

import { AppContext, createAppContext } from "@/contexts/app-context";
import { PwaContext } from "@/contexts/pwa-context";
import { FileDbStore, FileDbStoreContext } from "@/lib/file-db/file-db-store";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

import { Fallback } from "./fallback";
import { FileDbGate } from "./file-db-gate";
import { Loading } from "./loading";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [appContextValue] = useState(() => createAppContext(new AudioContext()));
  const [fileDbStore] = useState(() => new FileDbStore());
  const pwaUpdateState = usePwaState();

  return (
    <ThemeProvider defaultTheme="light">
      <FileDbStoreContext value={fileDbStore}>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaUpdateState}>
            <ErrorBoundary fallbackRender={Fallback} onReset={fileDbStore.reset}>
              <Suspense fallback={<Loading />}>
                <FileDbGate>{children}</FileDbGate>
              </Suspense>
            </ErrorBoundary>
          </PwaContext>
        </AppContext>
      </FileDbStoreContext>
    </ThemeProvider>
  );
}
