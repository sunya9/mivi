import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { Providers } from "./components/providers/providers";
import { registerSW } from "virtual:pwa-register";

const audioContext = new AudioContext();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers audioContext={audioContext}>
      <App />
    </Providers>
  </StrictMode>,
);

registerSW({ immediate: true });
