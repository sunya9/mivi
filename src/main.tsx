import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { AppContext, appContextValue } from "@/AppContext";
import { ThemeProvider } from "next-themes";
import { Fallback } from "@/components/Fallback.tsx";
import { Loading } from "@/components/Loading.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { ErrorBoundary } from "react-error-boundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <AppContext value={appContextValue}>
        <ErrorBoundary fallbackRender={Fallback}>
          <Suspense fallback={<Loading />}>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </Suspense>
        </ErrorBoundary>
      </AppContext>
    </ThemeProvider>
  </StrictMode>,
);
