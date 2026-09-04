import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AudioContext } from "standardized-audio-context";

import { AppContext, createAppContext } from "@/contexts/app-context";
import { PwaContext } from "@/contexts/pwa-context";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

import { Fallback } from "./fallback";
import { FileDbStoreProvider } from "./file-db-store-provider";
import { Loading } from "./loading";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [appContextValue] = useState(() => createAppContext(new AudioContext()));
  const pwaUpdateState = usePwaState();

  return (
    <ThemeProvider defaultTheme="light">
      <FileDbStoreProvider>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaUpdateState}>
            <ErrorBoundary fallbackRender={Fallback}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ErrorBoundary>
          </PwaContext>
        </AppContext>
      </FileDbStoreProvider>
    </ThemeProvider>
  );
}
