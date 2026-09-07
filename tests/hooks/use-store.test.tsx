import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { useStore } from "@/hooks/use-store";
import { ObservableStore } from "@/lib/store/observable-store";

class PointStore extends ObservableStore<{ x: number; y: number }> {
  move(x: number, y: number) {
    this.setSnapshot({ x, y });
  }
}

function setup<S>(store: PointStore, selector: (point: { x: number; y: number }) => S) {
  const renders = vi.fn<() => void>();
  const hook = renderHook(() => {
    renders();
    return useStore(store, selector);
  });
  return { ...hook, renders };
}

test("returns the selected value", () => {
  const { result } = setup(new PointStore({ x: 1, y: 2 }), (point) => point.y);
  expect(result.current).toBe(2);
});

test("re-renders when the selected value changes", () => {
  const store = new PointStore({ x: 1, y: 2 });
  const { result } = setup(store, (point) => point.x);

  act(() => store.move(5, 2));

  expect(result.current).toBe(5);
});

test("does not re-render when an unselected value changes", () => {
  const store = new PointStore({ x: 1, y: 2 });
  const { renders } = setup(store, (point) => point.x);
  const before = renders.mock.calls.length;

  act(() => store.move(1, 9));

  expect(renders.mock.calls.length).toBe(before);
});

test("reuses the previous selection while isEqual holds", () => {
  const store = new PointStore({ x: 1, y: 2 });
  const renders = vi.fn<() => void>();
  const { result } = renderHook(() => {
    renders();
    return useStore(
      store,
      (point) => ({ x: point.x }),
      (a, b) => a.x === b.x,
    );
  });
  const first = result.current;
  const before = renders.mock.calls.length;

  act(() => store.move(1, 9));
  expect(result.current).toBe(first);
  expect(renders.mock.calls.length).toBe(before);

  act(() => store.move(3, 9));
  expect(result.current).toEqual({ x: 3 });
});
