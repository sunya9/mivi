import { afterEach, expect, test, vi } from "vitest";

import { ThemeStore } from "@/lib/theme/theme-store";

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn<(query: string) => MediaQueryList>(() => mediaQueryList as unknown as MediaQueryList),
  );
  return {
    listenerCount: () => listeners.size,
    dispatchChange(nextMatches: boolean) {
      mediaQueryList.matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as unknown as MediaQueryListEvent),
      );
    },
  };
}

const root = document.documentElement;
const stores: ThemeStore[] = [];
function createStore(defaultTheme: "light" | "dark" | "system" = "light") {
  const store = new ThemeStore(defaultTheme);
  stores.push(store);
  return store;
}

afterEach(() => {
  stores.splice(0).forEach((store) => store.dispose());
  vi.unstubAllGlobals();
  root.classList.remove("light", "dark");
  root.style.colorScheme = "";
});

test("applies the default theme when nothing is stored", () => {
  mockMatchMedia(false);
  const store = createStore("light");
  expect(store.getSnapshot()).toEqual({ theme: "light", resolvedTheme: "light" });
  expect(root.classList.contains("light")).toBe(true);
});

test("restores the stored theme", () => {
  mockMatchMedia(false);
  localStorage.setItem("theme", "dark");
  const store = createStore("light");
  expect(store.getSnapshot().theme).toBe("dark");
  expect(root.classList.contains("dark")).toBe(true);
  expect(root.classList.contains("light")).toBe(false);
});

test("falls back to the default for an invalid stored value", () => {
  mockMatchMedia(false);
  localStorage.setItem("theme", "amoled");
  expect(createStore("light").getSnapshot().theme).toBe("light");
});

test("setTheme updates the root, persists the raw string, and notifies", () => {
  mockMatchMedia(false);
  const store = createStore("light");
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.setTheme("dark");

  expect(store.getSnapshot()).toEqual({ theme: "dark", resolvedTheme: "dark" });
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(root.classList.contains("dark")).toBe(true);
  expect(root.style.colorScheme).toBe("dark");
  expect(listener).toHaveBeenCalledOnce();
});

test("system theme resolves against matchMedia", () => {
  mockMatchMedia(true);
  localStorage.setItem("theme", "system");
  const store = createStore("light");
  expect(store.getSnapshot()).toEqual({ theme: "system", resolvedTheme: "dark" });
  expect(root.classList.contains("dark")).toBe(true);
});

test("system theme follows OS preference changes and exposes the resolved theme", () => {
  const media = mockMatchMedia(false);
  localStorage.setItem("theme", "system");
  const store = createStore("light");
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  media.dispatchChange(true);

  expect(store.getSnapshot().resolvedTheme).toBe("dark");
  expect(root.classList.contains("dark")).toBe(true);
  expect(listener).toHaveBeenCalledOnce();
});

test("stops following the OS after switching to a fixed theme", () => {
  const media = mockMatchMedia(false);
  localStorage.setItem("theme", "system");
  const store = createStore("light");

  store.setTheme("light");
  expect(media.listenerCount()).toBe(0);
  media.dispatchChange(true);

  expect(root.classList.contains("light")).toBe(true);
  expect(root.classList.contains("dark")).toBe(false);
});

test("dispose releases the OS listener", () => {
  const media = mockMatchMedia(false);
  localStorage.setItem("theme", "system");
  const store = createStore("light");
  expect(media.listenerCount()).toBe(1);

  store.dispose();

  expect(media.listenerCount()).toBe(0);
});
