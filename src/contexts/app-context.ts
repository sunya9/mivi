import { createContext, use } from "react";
import type { AppContextValue } from "../lib/globals";

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const context = use(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContext.Provider");
  }
  return context;
}
