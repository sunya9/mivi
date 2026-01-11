import { CacheContext } from "./cache-context";
import { useCallback, useState } from "react";

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [caches, setCaches] = useState<Map<string, unknown>>(new Map());
  const setCache = useCallback((key: string, cache: unknown) => {
    setCaches((prev) => {
      const newCaches = new Map(prev);
      newCaches.set(key, cache);
      return newCaches;
    });
  }, []);
  return <CacheContext value={{ caches, setCache }}>{children}</CacheContext>;
}
