import { afterEach, expect, test, vi } from "vitest";

import { PersistedStore } from "@/lib/store/persisted-store";

const KEY = "test-key";
const passthrough =
  <T>() =>
  (persisted: unknown) =>
    persisted as T;

afterEach(() => {
  localStorage.removeItem(KEY);
  vi.restoreAllMocks();
});

test("loads the persisted value on creation", () => {
  localStorage.setItem(KEY, JSON.stringify({ test: "value" }));
  const store = new PersistedStore<{ test: string } | undefined>(
    KEY,
    passthrough<{ test: string } | undefined>(),
  );
  expect(store.getSnapshot()).toEqual({ test: "value" });
});

test("is undefined when nothing is persisted", () => {
  const store = new PersistedStore<string | undefined>(KEY, passthrough<string | undefined>());
  expect(store.getSnapshot()).toBeUndefined();
});

test("hydrate shapes the persisted value and supplies defaults", () => {
  localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
  const store = new PersistedStore(KEY, (raw) => ({ a: 0, b: 2, ...(raw as object) }));
  expect(store.getSnapshot()).toEqual({ a: 1, b: 2 });
});

test("set persists the value and notifies", () => {
  const store = new PersistedStore<{ test: string } | undefined>(
    KEY,
    passthrough<{ test: string } | undefined>(),
  );
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.set({ test: "value" });

  expect(store.getSnapshot()).toEqual({ test: "value" });
  expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ test: "value" }));
  expect(listener).toHaveBeenCalledOnce();
});

test("set(undefined) removes the key", () => {
  localStorage.setItem(KEY, JSON.stringify({ test: "value" }));
  const store = new PersistedStore<{ test: string } | undefined>(
    KEY,
    passthrough<{ test: string } | undefined>(),
  );

  store.set(undefined);

  expect(store.getSnapshot()).toBeUndefined();
  expect(localStorage.getItem(KEY)).toBeNull();
});

test("set accepts a functional updater", () => {
  localStorage.setItem(KEY, JSON.stringify({ count: 1 }));
  const store = new PersistedStore<{ count: number } | undefined>(
    KEY,
    passthrough<{ count: number } | undefined>(),
  );

  store.set((prev) => ({ count: (prev?.count ?? 0) + 1 }));

  expect(store.getSnapshot()).toEqual({ count: 2 });
  expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ count: 2 }));
});

test("persists falsy values instead of removing the key", () => {
  const store = new PersistedStore<number | undefined>(KEY, passthrough<number | undefined>());
  store.set(0);
  expect(store.getSnapshot()).toBe(0);
  expect(localStorage.getItem(KEY)).toBe("0");
});

test("treats unparsable JSON as missing and reports it", () => {
  localStorage.setItem(KEY, "{aaa");
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const store = new PersistedStore<string | undefined>(KEY, passthrough<string | undefined>());
  expect(store.getSnapshot()).toBeUndefined();
  expect(error).toHaveBeenCalledOnce();
});

test('treats a corrupted "undefined" entry as missing and removes it', () => {
  localStorage.setItem(KEY, "undefined");
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const store = new PersistedStore<string | undefined>(KEY, passthrough<string | undefined>());
  expect(store.getSnapshot()).toBeUndefined();
  expect(localStorage.getItem(KEY)).toBeNull();
  expect(error).not.toHaveBeenCalled();
});
