import { ObservableStore } from "@/lib/store/observable-store";

export class ValueStore<T> extends ObservableStore<T> {
  set = (next: T | ((prev: T) => T)): void => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(this.getSnapshot()) : next;
    this.setSnapshot(value);
  };
}
