import { createContext, use } from "react";

export interface CacheContextValue {
  caches: Map<string, unknown>;
  setCache: (key: string, cache: unknown) => void;
}

export const CacheContext = createContext<CacheContextValue | null>(null);

export function useCacheContext(): CacheContextValue {
  const context = use(CacheContext);
  if (!context) {
    throw new Error("useCacheContext must be used within CacheProvider");
  }
  return context;
}
