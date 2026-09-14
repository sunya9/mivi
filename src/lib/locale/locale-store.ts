import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";
import {
  baseLocale,
  extractLocaleFromNavigator,
  isLocale,
  overwriteGetLocale,
  type Locale,
} from "@/paraglide/runtime";

export type LocalePreference = Locale | "system";

export interface LocaleSnapshot {
  readonly preference: LocalePreference;
  readonly locale: Locale;
}

const STORAGE_KEY = "locale";

function isLocalePreference(value: unknown): value is LocalePreference {
  return value === "system" || isLocale(value);
}

function loadStoredPreference(): LocalePreference | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLocalePreference(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function resolveLocale(preference: LocalePreference): Locale {
  if (preference !== "system") return preference;
  return extractLocaleFromNavigator() ?? baseLocale;
}

function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale;
}

export class LocaleStore extends ObservableStore<LocaleSnapshot> {
  #followingSystem = false;

  constructor() {
    const preference = loadStoredPreference() ?? "system";
    super({ preference, locale: resolveLocale(preference) }, shallowEqual);
    overwriteGetLocale(() => this.getSnapshot().locale);
    applyLocale(this.getSnapshot().locale);
    this.#followSystem(preference === "system");
  }

  setPreference = (preference: LocalePreference): void => {
    try {
      if (preference === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, preference);
      }
    } catch {
      // ignore
    }
    this.#followSystem(preference === "system");
    this.#apply(preference);
  };

  dispose = (): void => {
    this.#followSystem(false);
  };

  #apply(preference: LocalePreference): void {
    const locale = resolveLocale(preference);
    applyLocale(locale);
    this.setSnapshot({ preference, locale });
  }

  #handleSystemChange = (): void => {
    this.#apply(this.getSnapshot().preference);
  };

  #followSystem(follow: boolean): void {
    if (follow && !this.#followingSystem) {
      window.addEventListener("languagechange", this.#handleSystemChange);
    } else if (!follow && this.#followingSystem) {
      window.removeEventListener("languagechange", this.#handleSystemChange);
    }
    this.#followingSystem = follow;
  }
}
