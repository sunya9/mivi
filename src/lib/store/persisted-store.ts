import { ValueStore } from "@/lib/store/value-store";

// A functional updater used to be stringified directly, leaving "undefined" behind.
const CORRUPTED_RAW_VALUE = "undefined";

function loadValue<T>(key: string): T | undefined {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === CORRUPTED_RAW_VALUE) {
      localStorage.removeItem(key);
      return undefined;
    }
    if (rawValue) return JSON.parse(rawValue) as T;
  } catch (e) {
    console.error("parse error", e);
  }
  return undefined;
}

function persistValue(key: string, value: unknown): void {
  try {
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage may be full or unavailable (private mode); the in-memory value still wins
  }
}

export class PersistedStore<T> extends ValueStore<T> {
  readonly #key: string;

  constructor(key: string, hydrate: (persisted: T | undefined) => T) {
    super(hydrate(loadValue<T>(key)));
    this.#key = key;
  }

  override set = (next: T | ((prev: T) => T)): void => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(this.getSnapshot()) : next;
    persistValue(this.#key, value);
    this.setSnapshot(value);
  };
}
