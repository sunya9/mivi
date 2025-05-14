import { useCallback, useState } from "react";

const loadValue = <T>(key: string): T | undefined => {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue) {
      const value = JSON.parse(rawValue) as T;
      return value;
    }
  } catch (e) {
    console.error("parse error", e);
  }
};

export function useLocalStorage<T>(
  key: string,
): [T | undefined, (value: T) => void] {
  const [value, setValueInternal] = useState<T | undefined>(() =>
    loadValue<T>(key),
  );
  const setValue = useCallback(
    (value?: T) => {
      if (!value) {
        localStorage.removeItem(key);
      } else {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
      }
      setValueInternal(value);
    },
    [key],
  );

  return [value, setValue];
}
