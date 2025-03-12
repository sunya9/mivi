import { useEffect, useState } from "react";

const cachedStorageValues = new Map<string, unknown>();

const loadInitialValue = <T>(key: string): T | undefined => {
  if (cachedStorageValues.has(key)) {
    return cachedStorageValues.get(key) as T;
  }
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue) {
      const value = JSON.parse(rawValue) as T;
      cachedStorageValues.set(key, value);
      return value;
    }
  } catch (e) {
    console.error("parse error", e);
  }
};

export const useLocalStorage = <T>(
  key: string,
): [T | undefined, (value: T) => void] => {
  const [value, setValue] = useState<T | undefined>(loadInitialValue<T>(key));

  useEffect(() => {
    if (value) {
      const json = JSON.stringify(value);
      window.localStorage.setItem(key, json);
    } else {
      window.localStorage.removeItem(key);
    }
  }, [value, key]);
  return [value, setValue];
};
