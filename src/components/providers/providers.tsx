import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext, createAppContext } from "../../contexts/app-context";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { ThemeProvider } from "next-themes";
import { CacheProvider } from "./cache-provider";
import { usePwaState } from "@/lib/pwa/use-pwa-state";
import { PwaContext } from "@/contexts/pwa-context";

interface ProvidersProps {
  children: React.ReactNode;
  audioContext: AudioContext;
}

export function Providers({ children, audioContext }: ProvidersProps) {
  const [appContextValue] = useState(() => createAppContext(audioContext));
  const pwaUpdateState = usePwaState();

  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <CacheProvider>
        <AppContext value={appContextValue}>
          <PwaContext value={pwaUpdateState}>
            <ErrorBoundary fallbackRender={Fallback}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ErrorBoundary>
          </PwaContext>
        </AppContext>
      </CacheProvider>
    </ThemeProvider>
  );
}
