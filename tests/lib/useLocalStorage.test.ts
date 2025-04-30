import { test, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/lib/useLocalStorage";

const mockValue = { test: "value" };

test("returns initial value from localStorage", () => {
  localStorage.setItem("test-key", JSON.stringify(mockValue));

  const { result } = renderHook(() =>
    useLocalStorage<typeof mockValue>("test-key"),
  );
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
  console.error = vi.fn();
  const { result } = renderHook(() => useLocalStorage<string>("test-key"));
  expect(result.current[0]).toBeUndefined();
  expect(console.error).toHaveBeenCalledTimes(1);
});
