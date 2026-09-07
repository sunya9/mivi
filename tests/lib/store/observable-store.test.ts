import { expect, test, vi } from "vitest";

import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";

class CounterStore extends ObservableStore<number> {
  increment() {
    this.setSnapshot(this.getSnapshot() + 1);
  }
  set(value: number) {
    this.setSnapshot(value);
  }
}

test("exposes the latest snapshot", () => {
  const store = new CounterStore(0);
  store.increment();
  expect(store.getSnapshot()).toBe(1);
});

test("notifies subscribers when the snapshot changes", () => {
  const store = new CounterStore(0);
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.increment();
  expect(listener).toHaveBeenCalledOnce();
});

test("skips notification when the snapshot is equal", () => {
  const store = new CounterStore(3);
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.set(3);
  expect(listener).not.toHaveBeenCalled();
});

test("stops notifying after unsubscribe", () => {
  const store = new CounterStore(0);
  const listener = vi.fn<() => void>();
  const unsubscribe = store.subscribe(listener);

  unsubscribe();
  store.increment();
  expect(listener).not.toHaveBeenCalled();
});

test("accepts a custom equality to compare structured snapshots", () => {
  class PointStore extends ObservableStore<{ x: number; y: number }> {
    move(x: number, y: number) {
      this.setSnapshot({ x, y });
    }
  }
  const store = new PointStore({ x: 0, y: 0 }, shallowEqual);
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.move(0, 0);
  expect(listener).not.toHaveBeenCalled();

  store.move(1, 0);
  expect(listener).toHaveBeenCalledOnce();
});
