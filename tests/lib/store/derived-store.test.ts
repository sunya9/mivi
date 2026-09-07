import { expect, test, vi } from "vitest";

import { derived } from "@/lib/store/derived-store";
import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";

class CounterStore extends ObservableStore<number> {
  set(value: number) {
    this.setSnapshot(value);
  }
}

test("computes from the current source values", () => {
  const a = new CounterStore(1);
  const b = new CounterStore(2);
  const sum = derived([a, b], (read) => read(a) + read(b));
  expect(sum.getSnapshot()).toBe(3);
});

test("recomputes and notifies when any source changes", () => {
  const a = new CounterStore(1);
  const b = new CounterStore(2);
  const sum = derived([a, b], (read) => read(a) + read(b));
  const listener = vi.fn<() => void>();
  sum.subscribe(listener);

  a.set(10);
  expect(sum.getSnapshot()).toBe(12);
  b.set(5);
  expect(sum.getSnapshot()).toBe(15);
  expect(listener).toHaveBeenCalledTimes(2);
});

test("does not notify when the derived value is equal", () => {
  const a = new CounterStore(1);
  const parity = derived([a], (read) => read(a) % 2);
  const listener = vi.fn<() => void>();
  parity.subscribe(listener);

  a.set(3);
  expect(listener).not.toHaveBeenCalled();
});

test("uses the given equality for structured values", () => {
  const a = new CounterStore(1);
  const point = derived([a], (read) => ({ x: read(a), y: 0 }), shallowEqual);
  const before = point.getSnapshot();
  const listener = vi.fn<() => void>();
  point.subscribe(listener);

  a.set(1);
  expect(point.getSnapshot()).toBe(before);
  expect(listener).not.toHaveBeenCalled();
});

test("dispose detaches from the sources", () => {
  const a = new CounterStore(1);
  const doubled = derived([a], (read) => read(a) * 2);

  doubled.dispose();
  a.set(5);

  expect(doubled.getSnapshot()).toBe(2);
});
