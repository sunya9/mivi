import { test, expect, vi, beforeEach, afterEach } from "vitest";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn<(query: string) => MediaQueryList>(() => ({ matches }) as MediaQueryList),
  );
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.style.colorScheme = "";
});

test("applies stored dark theme", async () => {
  mockMatchMedia(false);
  localStorage.setItem("theme", "dark");

  await import("@/lib/theme-init");

  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(document.documentElement.style.colorScheme).toBe("dark");
});

test("resolves system theme with matchMedia", async () => {
  mockMatchMedia(true);
  localStorage.setItem("theme", "system");

  await import("@/lib/theme-init");

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("defaults to light when nothing is stored", async () => {
  mockMatchMedia(true);

  await import("@/lib/theme-init");

  expect(document.documentElement.classList.contains("light")).toBe(true);
  expect(document.documentElement.style.colorScheme).toBe("light");
});
