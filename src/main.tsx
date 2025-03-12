import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { AppContext, appContextValue } from "@/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppContext value={appContextValue}>
      <App />
    </AppContext>
  </StrictMode>,
);
