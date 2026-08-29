import { test, expect, vi, afterEach } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useTheme } from "@/contexts/theme-context";

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
    dispatchChange(nextMatches: boolean) {
      mediaQueryList.matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as unknown as MediaQueryListEvent),
      );
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.style.colorScheme = "";
});

function renderUseTheme(defaultTheme?: "light" | "dark" | "system") {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
    ),
  });
}

test("applies default theme when no stored value", () => {
  mockMatchMedia(false);
  const { result } = renderUseTheme("light");
  expect(result.current.theme).toBe("light");
  expect(document.documentElement.classList.contains("light")).toBe(true);
});

test("restores stored theme", () => {
  mockMatchMedia(false);
  localStorage.setItem("theme", "dark");
  const { result } = renderUseTheme("light");
  expect(result.current.theme).toBe("dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(document.documentElement.classList.contains("light")).toBe(false);
});

test("falls back to default theme for invalid stored value", () => {
  mockMatchMedia(false);
  localStorage.setItem("theme", "amoled");
  const { result } = renderUseTheme("light");
  expect(result.current.theme).toBe("light");
  expect(document.documentElement.classList.contains("light")).toBe(true);
});

test("setTheme updates class, colorScheme and persists raw string", () => {
  mockMatchMedia(false);
  const { result } = renderUseTheme("light");

  act(() => result.current.setTheme("dark"));

  expect(result.current.theme).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(document.documentElement.classList.contains("light")).toBe(false);
  expect(document.documentElement.style.colorScheme).toBe("dark");
});

test("system theme resolves with matchMedia", () => {
  mockMatchMedia(true);
  localStorage.setItem("theme", "system");
  const { result } = renderUseTheme("light");
  expect(result.current.theme).toBe("system");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("system theme follows OS preference changes", () => {
  const media = mockMatchMedia(false);
  localStorage.setItem("theme", "system");
  renderUseTheme("light");
  expect(document.documentElement.classList.contains("light")).toBe(true);

  act(() => media.dispatchChange(true));

  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(document.documentElement.classList.contains("light")).toBe(false);
});

test("stops following OS preference after switching to a fixed theme", () => {
  const media = mockMatchMedia(false);
  localStorage.setItem("theme", "system");
  const { result } = renderUseTheme("light");

  act(() => result.current.setTheme("light"));
  act(() => media.dispatchChange(true));

  expect(document.documentElement.classList.contains("light")).toBe(true);
  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

test("useTheme throws outside ThemeProvider", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<ProbeWithoutProvider />)).toThrow(
    "useTheme must be used within a ThemeProvider",
  );
});

function ProbeWithoutProvider() {
  useTheme();
  return null;
}
