import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext, createAppContext } from "../../contexts/app-context";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { ThemeProvider } from "next-themes";
import { FileDbStoreProvider } from "./file-db-store-provider";
import { usePwaState } from "@/lib/pwa/use-pwa-state";
import { PwaContext } from "@/contexts/pwa-context";
import { AudioContext } from "standardized-audio-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [appContextValue] = useState(() => createAppContext(new AudioContext()));
  const pwaUpdateState = usePwaState();

  return (
    <ThemeProvider themes={["light", "dark"]} defaultTheme="light" attribute="class">
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
