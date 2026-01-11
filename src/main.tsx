import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { Providers } from "./components/providers/providers";
import { registerSW } from "virtual:pwa-register";
import { createAppContext } from "./lib/globals";

const appContextValue = createAppContext();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers appContextValue={appContextValue}>
      <App />
    </Providers>
  </StrictMode>,
);

registerSW({ immediate: true });
