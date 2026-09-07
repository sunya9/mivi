import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

export interface ThemeSnapshot {
  readonly theme: Theme;
  readonly resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = "theme";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function loadStoredTheme(): Theme | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme;
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

function applyTheme(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}

export class ThemeStore extends ObservableStore<ThemeSnapshot> {
  #mediaQueryList: MediaQueryList | null = null;

  constructor(defaultTheme: Theme) {
    const theme = loadStoredTheme() ?? defaultTheme;
    super({ theme, resolvedTheme: resolveTheme(theme) }, shallowEqual);
    applyTheme(this.getSnapshot().resolvedTheme);
    this.#followSystem(theme === "system");
  }

  setTheme = (theme: Theme): void => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The theme still applies for this session even if persistence fails
    }
    this.#followSystem(theme === "system");
    this.#apply(theme);
  };

  dispose = (): void => {
    this.#followSystem(false);
  };

  #apply(theme: Theme): void {
    const resolvedTheme = resolveTheme(theme);
    applyTheme(resolvedTheme);
    this.setSnapshot({ theme, resolvedTheme });
  }

  #handleSystemChange = (): void => {
    this.#apply(this.getSnapshot().theme);
  };

  #followSystem(follow: boolean): void {
    if (follow && !this.#mediaQueryList) {
      this.#mediaQueryList = window.matchMedia(DARK_SCHEME_QUERY);
      this.#mediaQueryList.addEventListener("change", this.#handleSystemChange);
    } else if (!follow && this.#mediaQueryList) {
      this.#mediaQueryList.removeEventListener("change", this.#handleSystemChange);
      this.#mediaQueryList = null;
    }
  }
}
