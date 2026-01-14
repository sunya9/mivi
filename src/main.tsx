import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { Providers } from "./components/providers/providers";

const audioContext = new AudioContext();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers audioContext={audioContext}>
      <App />
    </Providers>
  </StrictMode>,
);
