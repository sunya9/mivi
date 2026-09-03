import { Dispatch, SetStateAction, useCallback, useState } from "react";

// A functional updater used to be stringified directly, leaving "undefined" behind.
const CORRUPTED_RAW_VALUE = "undefined";

function loadValue<T>(key: string): T | undefined {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === CORRUPTED_RAW_VALUE) {
      localStorage.removeItem(key);
      return;
    }
    if (rawValue) {
      const value = JSON.parse(rawValue) as T;
      return value;
    }
  } catch (e) {
    console.error("parse error", e);
  }
}

function isUpdater<T>(action: SetStateAction<T>): action is (prev: T) => T {
  return typeof action === "function";
}

function persistValue<T>(key: string, value: T | undefined) {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function useLocalStorage<T>(
  key: string,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [value, setValueInternal] = useState<T | undefined>(() => loadValue<T>(key));
  const setValue: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (newValue) => {
      setValueInternal((prev) => {
        const next = isUpdater(newValue) ? newValue(prev) : newValue;
        persistValue(key, next);
        return next;
      });
    },
    [key],
  );
  return [value, setValue];
}
