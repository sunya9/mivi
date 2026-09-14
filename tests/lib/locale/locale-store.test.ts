import { afterEach, expect, test, vi } from "vitest";

import { LocaleStore } from "@/lib/locale/locale-store";
import { getLocale } from "@/paraglide/runtime";

const root = document.documentElement;
const stores: LocaleStore[] = [];
function createStore() {
  const store = new LocaleStore();
  stores.push(store);
  return store;
}

function stubLanguages(languages: string[]) {
  return vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
}

afterEach(() => {
  stores.splice(0).forEach((store) => store.dispose());
  vi.restoreAllMocks();
  root.lang = "";
});

test("follows the browser language when nothing is stored", () => {
  stubLanguages(["ja-JP", "en-US"]);
  const store = createStore();
  expect(store.getSnapshot()).toEqual({ preference: "system", locale: "ja" });
  expect(getLocale()).toBe("ja");
  expect(root.lang).toBe("ja");
});

test("falls back to the base locale for an unsupported browser language", () => {
  stubLanguages(["fr-FR"]);
  expect(createStore().getSnapshot()).toEqual({ preference: "system", locale: "en" });
  expect(root.lang).toBe("en");
});

test("restores the stored preference over the browser language", () => {
  stubLanguages(["en-US"]);
  localStorage.setItem("locale", "ja");
  expect(createStore().getSnapshot()).toEqual({ preference: "ja", locale: "ja" });
  expect(getLocale()).toBe("ja");
});

test("ignores an invalid stored value", () => {
  stubLanguages(["ja"]);
  localStorage.setItem("locale", "klingon");
  expect(createStore().getSnapshot()).toEqual({ preference: "system", locale: "ja" });
});

test("setPreference persists the raw string, updates the document, and notifies", () => {
  stubLanguages(["en-US"]);
  const store = createStore();
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.setPreference("ja");

  expect(store.getSnapshot()).toEqual({ preference: "ja", locale: "ja" });
  expect(localStorage.getItem("locale")).toBe("ja");
  expect(getLocale()).toBe("ja");
  expect(root.lang).toBe("ja");
  expect(listener).toHaveBeenCalledOnce();
});

test("system preference follows browser language changes", () => {
  const languages = stubLanguages(["en-US"]);
  const store = createStore();
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  languages.mockReturnValue(["ja"]);
  window.dispatchEvent(new Event("languagechange"));

  expect(store.getSnapshot().locale).toBe("ja");
  expect(root.lang).toBe("ja");
  expect(listener).toHaveBeenCalledOnce();
});

test("stops following the browser after choosing a fixed locale", () => {
  const languages = stubLanguages(["en-US"]);
  const store = createStore();

  store.setPreference("en");
  languages.mockReturnValue(["ja"]);
  window.dispatchEvent(new Event("languagechange"));

  expect(store.getSnapshot().locale).toBe("en");
});

test("switching back to system re-reads the browser language", () => {
  const languages = stubLanguages(["en-US"]);
  const store = createStore();
  store.setPreference("ja");

  languages.mockReturnValue(["en-US"]);
  store.setPreference("system");

  expect(store.getSnapshot()).toEqual({ preference: "system", locale: "en" });
  expect(localStorage.getItem("locale")).toBeNull();
});

test("dispose releases the browser language listener", () => {
  const languages = stubLanguages(["en-US"]);
  const store = createStore();

  store.dispose();
  languages.mockReturnValue(["ja"]);
  window.dispatchEvent(new Event("languagechange"));

  expect(store.getSnapshot().locale).toBe("en");
});
