import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [value, setValue] = useState<T | undefined>(() => loadValue<T>(key));
  useEffect(() => {
    if (!value) {
      localStorage.removeItem(key);
    } else {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    }
  }, [key, value]);

  return [value, setValue];
}
