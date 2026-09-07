import { ObservableStore, type ReadableStore } from "@/lib/store/observable-store";

export type ReadStore = <V>(store: ReadableStore<V>) => V;

export class DerivedStore<T> extends ObservableStore<T> {
  readonly #unsubscribes: (() => void)[];

  constructor(
    sources: readonly ReadableStore<unknown>[],
    compute: (read: ReadStore) => T,
    isEqual?: (a: T, b: T) => boolean,
  ) {
    const read: ReadStore = (store) => store.getSnapshot();
    super(compute(read), isEqual);
    this.#unsubscribes = sources.map((source) =>
      source.subscribe(() => this.setSnapshot(compute(read))),
    );
  }

  dispose = (): void => {
    this.#unsubscribes.splice(0).forEach((unsubscribe) => unsubscribe());
  };
}

export function derived<T>(
  sources: readonly ReadableStore<unknown>[],
  compute: (read: ReadStore) => T,
  isEqual?: (a: T, b: T) => boolean,
): DerivedStore<T> {
  return new DerivedStore(sources, compute, isEqual);
}
