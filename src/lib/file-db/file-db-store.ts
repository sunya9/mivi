import { fetchValue, saveValue } from "@/lib/file-db/file-db";
import { createContext, use, useSyncExternalStore } from "react";
import { type StoredAudioData } from "../audio/audio";
import { errorLogWithToast } from "../utils";

export interface FileDbEntry<T = unknown> {
  file: File;
  decoded: T;
}

type CacheSlotResult<T> =
  | { type: "initial" }
  | {
      type: "pending";
      promise: Promise<void>;
    }
  | {
      type: "fulfilled";
      data: FileDbEntry<T> | undefined;
    };

class CacheSlot<T> {
  #dbKey: string;
  #listeners = new Set<() => void>();
  #result: CacheSlotResult<T> = { type: "initial" };

  constructor(dbKey: string) {
    this.#dbKey = dbKey;
  }

  get loaded() {
    return this.#result.type === "fulfilled";
  }

  get data() {
    return this.#result.type === "fulfilled" ? this.#result.data : undefined;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  load(): Promise<void> {
    if (this.#result.type === "pending") return this.#result.promise;

    const promise = fetchValue<FileDbEntry<T>>(this.#dbKey).then((entry) => {
      this.#result = {
        type: "fulfilled",
        data: entry,
      };
      this.#notify();
    });
    return promise;
  }

  setEntry = async (entry: FileDbEntry<T> | undefined): Promise<void> => {
    this.#result = {
      type: "fulfilled",
      data: entry,
    };
    this.#notify();
    try {
      await saveValue(this.#dbKey, entry);
    } catch (error) {
      errorLogWithToast("Failed to save file", error);
    }
  };

  #notify(): void {
    this.#listeners.forEach((listener) => listener());
  }
}

export class FileDbStore {
  readonly audio = new CacheSlot<StoredAudioData>("db:audio");
  readonly backgroundImage = new CacheSlot<ImageBitmap>("db:background-image");
}

export const FileDbStoreContext = createContext<FileDbStore | null>(null);

function useFileDbStore(): FileDbStore {
  const store = use(FileDbStoreContext);
  if (!store) {
    throw new Error("useFileDb must be used within FileDbStoreProvider");
  }
  return store;
}

function useSlot<T>(slot: CacheSlot<T>) {
  // Suspend until initial data is loaded from IndexedDB
  if (!slot.loaded) {
    throw slot.load();
  }

  const entry = useSyncExternalStore(slot.subscribe, () => slot.data);

  return {
    ...entry,
    setEntry: slot.setEntry,
  };
}

export function useAudioFileDb() {
  const store = useFileDbStore();
  return useSlot(store.audio);
}

export function useBackgroundImageFileDb() {
  const store = useFileDbStore();
  return useSlot(store.backgroundImage);
}
