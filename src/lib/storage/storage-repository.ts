/** Interface for key-value storage operations */
export interface StorageRepository {
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
}

/** LocalStorage implementation of StorageRepository */
export class LocalStorageRepository implements StorageRepository {
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors (e.g., quota exceeded, private mode)
    }
  }
}
