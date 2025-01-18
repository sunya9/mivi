import { useEffect, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";

import config from "../../tailwind.config";

const breakpoints = resolveConfig(config).theme.screens;

type Key = keyof typeof breakpoints;

const createMediaQueryList = <K extends Key>(key: K) =>
  window.matchMedia(`(min-width: ${breakpoints[key]})`);

export const useMediaQuery = <K extends Key>(key: K) => {
  const [matches, setMatches] = useState<boolean>(
    createMediaQueryList(key).matches,
  );

  useEffect(() => {
    const mediaQueryList = createMediaQueryList(key);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQueryList.addEventListener("change", handler);
    return () => {
      mediaQueryList.removeEventListener("change", handler);
    };
  }, [key]);
  return matches;
};
