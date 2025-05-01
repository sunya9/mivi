import { createContext } from "react";

export const CacheContext = createContext<{
  caches: Map<string, unknown>;
  setCache: (key: string, cache: unknown) => void;
}>({
  caches: new Map(),
  setCache: () => {},
});
