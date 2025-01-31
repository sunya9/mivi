import { useCallback, useMemo, useSyncExternalStore } from "react";

type Key = "sm" | "md" | "lg" | "xl" | "2xl";

export function useMediaQuery(key: Key): boolean {
  const matchMediaList = useMemo(() => {
    const minWidth = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(`--breakpoint-${key}`);
    console.log(minWidth);
    return window.matchMedia(`(min-width: ${minWidth})`);
  }, [key]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      matchMediaList.addEventListener("change", onStoreChange);
      return () => matchMediaList.removeEventListener("change", onStoreChange);
    },
    [matchMediaList],
  );

  return useSyncExternalStore(subscribe, () => matchMediaList.matches);
}
