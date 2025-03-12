import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { AppContext, appContextValue } from "@/AppContext";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      <AppContext value={appContextValue}>
        <App />
      </AppContext>
    </ThemeProvider>
  </StrictMode>,
);
