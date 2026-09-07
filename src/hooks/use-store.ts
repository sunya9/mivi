import { useRef, useSyncExternalStore } from "react";

import type { ReadableStore } from "@/lib/store/observable-store";

/**
 * Subscribes to a slice of an external store. Without `isEqual` the selector must return a
 * primitive or a stable reference; with it, the previous selection is reused while equal.
 */
export function useStore<T, S>(
  store: ReadableStore<T>,
  selector: (snapshot: T) => S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): S {
  const last = useRef<{ snapshot: T; selected: S } | null>(null);
  return useSyncExternalStore(store.subscribe, () => {
    const snapshot = store.getSnapshot();
    const cached = last.current;
    if (cached && Object.is(cached.snapshot, snapshot)) return cached.selected;
    const selected = selector(snapshot);
    if (cached && isEqual(cached.selected, selected)) {
      last.current = { snapshot, selected: cached.selected };
      return cached.selected;
    }
    last.current = { snapshot, selected };
    return selected;
  });
}
