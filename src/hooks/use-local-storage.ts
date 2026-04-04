import { Dispatch, SetStateAction, useCallback, useState } from "react";

function loadValue<T>(key: string): T | undefined {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue) {
      const value = JSON.parse(rawValue) as T;
      return value;
    }
  } catch (e) {
    console.error("parse error", e);
  }
}

export function useLocalStorage<T>(
  key: string,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [value, setValueInternal] = useState<T | undefined>(() => loadValue<T>(key));
  const setValue: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (newValue) => {
      if (!newValue) {
        localStorage.removeItem(key);
      } else {
        const json = JSON.stringify(newValue);
        localStorage.setItem(key, json);
      }
      setValueInternal(newValue);
    },
    [key],
  );
  return [value, setValue];
}
