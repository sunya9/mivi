import { use, useSyncExternalStore } from "react";

import type { FileSlot, FileSlotSnapshot } from "@/lib/file-store/file-slot";

export function useFileSlot<T>(slot: FileSlot<T>): FileSlotSnapshot<T> {
  if (!slot.loaded) {
    use(slot.load());
  }
  return useSyncExternalStore(slot.subscribe, slot.getSnapshot);
}
