import { renderHook, act } from "@testing-library/react";
import { test, expect, vi } from "vitest";

import { useLocalStorage } from "@/hooks/use-local-storage";

const mockValue = { test: "value" };

test("returns initial value from localStorage", () => {
  localStorage.setItem("test-key", JSON.stringify(mockValue));

  const { result } = renderHook(() => useLocalStorage<typeof mockValue>("test-key"));
  expect(result.current[0]).toEqual(mockValue);
});

test("returns undefined when no value exists in localStorage", () => {
  const { result } = renderHook(() => useLocalStorage("test-key"));
  expect(result.current[0]).toBeUndefined();
});

test("updates localStorage when value changes", () => {
  const { result } = renderHook(() => useLocalStorage("test-key"));

  act(() => {
    result.current[1](mockValue);
  });

  expect(result.current[0]).toEqual(mockValue);
  expect(localStorage.getItem("test-key")).toEqual(JSON.stringify(mockValue));
});

test("removes item from localStorage when value is undefined", () => {
  localStorage.setItem("test-key", JSON.stringify(mockValue));
  const { result } = renderHook(() => useLocalStorage("test-key"));

  act(() => {
    result.current[1](undefined);
  });
  expect(result.current[0]).toBeUndefined();
  expect(localStorage.getItem("test-key")).toBeNull();
});

test("handles JSON parse errors gracefully", () => {
  localStorage.setItem("test-key", "{aaa");
  console.error = vi.fn<(...data: unknown[]) => void>();
  const { result } = renderHook(() => useLocalStorage<string>("test-key"));
  expect(result.current[0]).toBeUndefined();
  expect(console.error).toHaveBeenCalledTimes(1);
});

test("persists the resolved value when setter receives a functional updater", () => {
  localStorage.setItem("test-key", JSON.stringify({ count: 1 }));
  const { result } = renderHook(() => useLocalStorage<{ count: number }>("test-key"));

  act(() => {
    result.current[1]((prev) => ({ count: (prev?.count ?? 0) + 1 }));
  });

  expect(result.current[0]).toEqual({ count: 2 });
  expect(localStorage.getItem("test-key")).toEqual(JSON.stringify({ count: 2 }));
});

test("removes item from localStorage when functional updater returns undefined", () => {
  localStorage.setItem("test-key", JSON.stringify(mockValue));
  const { result } = renderHook(() => useLocalStorage<typeof mockValue>("test-key"));

  act(() => {
    result.current[1](() => undefined);
  });

  expect(result.current[0]).toBeUndefined();
  expect(localStorage.getItem("test-key")).toBeNull();
});

test("reads back a value persisted by a functional updater on the next render", () => {
  const { result } = renderHook(() => useLocalStorage<{ count: number }>("test-key"));

  act(() => {
    result.current[1](() => ({ count: 5 }));
  });

  const { result: reloaded } = renderHook(() => useLocalStorage<{ count: number }>("test-key"));
  expect(reloaded.current[0]).toEqual({ count: 5 });
});

test('treats a corrupted "undefined" entry as missing and removes it', () => {
  localStorage.setItem("test-key", "undefined");
  console.error = vi.fn<(...data: unknown[]) => void>();

  const { result } = renderHook(() => useLocalStorage<string>("test-key"));

  expect(result.current[0]).toBeUndefined();
  expect(localStorage.getItem("test-key")).toBeNull();
  expect(console.error).not.toHaveBeenCalled();
});

test("persists falsy values instead of removing the key", () => {
  const { result } = renderHook(() => useLocalStorage<number>("test-key"));

  act(() => {
    result.current[1](0);
  });

  expect(result.current[0]).toBe(0);
  expect(localStorage.getItem("test-key")).toEqual("0");
});
