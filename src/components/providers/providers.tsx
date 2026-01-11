import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppContext } from "../../contexts/app-context";
import { AppContextValue } from "../../lib/globals";
import { Fallback } from "./fallback";
import { Loading } from "./loading";
import { ThemeProvider } from "next-themes";
import { CacheProvider } from "@/lib/cache/cache-provider";

interface ProvidersProps {
  children: React.ReactNode;
  appContextValue: AppContextValue;
}

export function Providers({ children, appContextValue }: ProvidersProps) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <CacheProvider>
        <AppContext value={appContextValue}>
          <ErrorBoundary fallbackRender={Fallback}>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ErrorBoundary>
        </AppContext>
      </CacheProvider>
    </ThemeProvider>
  );
}
