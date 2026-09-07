import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "unfonts.css";
import { AudioContext } from "standardized-audio-context";

import { App } from "./app";
import { Providers } from "./components/providers/providers";
import { createAppContext } from "./contexts/app-context";
import { purgeLegacyStorage } from "./lib/storage-migration";

void purgeLegacyStorage();
const appContextValue = createAppContext(new AudioContext());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers appContextValue={appContextValue}>
      <App />
    </Providers>
  </StrictMode>,
);
