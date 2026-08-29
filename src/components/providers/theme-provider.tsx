import { useCallback, useEffect, useMemo, useState } from "react";

import { Theme, ThemeContext } from "@/contexts/theme-context";

const themeStorageKey = "theme";
const darkSchemeQuery = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function loadStoredTheme(): Theme | undefined {
  try {
    const value = localStorage.getItem(themeStorageKey);
    return isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia(darkSchemeQuery).matches ? "dark" : "light";
}

function applyTheme(resolvedTheme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => loadStoredTheme() ?? defaultTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(themeStorageKey, newTheme);
    } catch {
      // theme still applies for the session even if persistence fails
    }
    setThemeState(newTheme);
  }, []);

  useEffect(() => {
    applyTheme(resolveTheme(theme));
    if (theme !== "system") return;
    const mediaQueryList = window.matchMedia(darkSchemeQuery);
    const handleChange = (event: MediaQueryListEvent) => {
      applyTheme(event.matches ? "dark" : "light");
    };
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [theme]);

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}
