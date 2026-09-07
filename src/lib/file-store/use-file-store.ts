import { createContext, use, useSyncExternalStore } from "react";

import type { FileSlot, FileSlotSnapshot } from "@/lib/file-store/file-slot";
import type { FileStore } from "@/lib/file-store/file-store";

export const FileStoreContext = createContext<FileStore | null>(null);

export function useFileStore(): FileStore {
  const store = use(FileStoreContext);
  if (!store) {
    throw new Error("useFileStore must be used within FileStoreContext");
  }
  return store;
}

export function useFileSlot<T>(slot: FileSlot<T>): FileSlotSnapshot<T> {
  if (!slot.loaded) {
    use(slot.load());
  }
  return useSyncExternalStore(slot.subscribe, slot.getSnapshot);
}
