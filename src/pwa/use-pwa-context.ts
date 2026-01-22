import { use } from "react";
import { PwaContext } from "./pwa-context";

export function usePwaContext() {
  const context = use(PwaContext);
  if (!context) {
    throw new Error("usePwaContext must be used within PwaContext.Provider");
  }
  return context;
}
