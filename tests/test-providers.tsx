import { AppContext } from "@/contexts/app-context";
import { CacheProvider } from "@/lib/cache/cache-provider";
import { AppContextValue } from "@/lib/globals";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

/**
 * Test wrapper that provides AppContext.
 */
export function TestProviders({
  children,
  appContextValue,
}: {
  children: React.ReactNode;
  appContextValue: AppContextValue;
}) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <CacheProvider>
        <AppContext value={appContextValue}>
          <Suspense fallback={null}>{children}</Suspense>
        </AppContext>
      </CacheProvider>
    </ThemeProvider>
  );
}
