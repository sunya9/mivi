/** The subset of a store that useSyncExternalStore and selector hooks need */
export interface ReadableStore<T> {
  readonly subscribe: (listener: () => void) => () => void;
  readonly getSnapshot: () => T;
}

export function shallowEqual<T extends object>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  const keys = Object.keys(a) as (keyof T)[];
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => Object.is(a[key], b[key]));
}

export class ObservableStore<T> implements ReadableStore<T> {
  #snapshot: T;
  readonly #listeners = new Set<() => void>();
  readonly #isEqual: (a: T, b: T) => boolean;

  constructor(initial: T, isEqual: (a: T, b: T) => boolean = Object.is) {
    this.#snapshot = initial;
    this.#isEqual = isEqual;
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  readonly getSnapshot = (): T => this.#snapshot;

  protected setSnapshot(next: T): void {
    if (this.#isEqual(this.#snapshot, next)) return;
    this.#snapshot = next;
    this.#listeners.forEach((listener) => listener());
  }
}
