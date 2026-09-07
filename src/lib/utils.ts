import { clsx, type ClassValue } from "clsx";
import { flushSync } from "react-dom";
import { twMerge } from "tailwind-merge";

import type { FileStore } from "@/lib/file-store/file-store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function resetConfig(fileStore: FileStore) {
  await fileStore.clear();
  localStorage.clear();
  location.reload();
}

export function startViewTransition(callback: () => void, options?: { types?: string[] }) {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  return document.startViewTransition({
    // React defers state updates made outside its event handlers, so without flushSync the
    // browser would capture the new state before React commits and animate nothing
    update: () => {
      flushSync(callback);
    },
    ...options,
  });
}
