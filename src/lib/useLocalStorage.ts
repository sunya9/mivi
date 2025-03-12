import { useEffect, useState } from "react";

export const useLocalStorage = <T>(
  key: string,
): [T | undefined, (value: T) => void] => {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue) {
      try {
        const parsedValue = JSON.parse(rawValue) as T;
        setValue(parsedValue);
      } catch (e) {
        console.error("parse error", e);
      }
    }
  }, [key]);

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
