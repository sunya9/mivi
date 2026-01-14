import { use } from "react";
import { PwaContext } from "./pwa-update-context";

export function usePwaContext() {
  const context = use(PwaContext);
  if (!context) {
    throw new Error(
      "usePwaContext must be used within PwaUpdateContext.Provider",
    );
  }
  return context;
}
