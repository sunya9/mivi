import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function resetConfig() {
  // delete indexedDB databases
  const databases = await indexedDB.databases();
  const promises = databases
    .map((db) => db.name)
    .filter((name) => typeof name === "string")
    .map((name) => {
      const req = indexedDB.deleteDatabase(name);
      return new Promise<void>((resolve, reject) => {
        req.onsuccess = () => resolve();
        req.onblocked = reject;
        req.onerror = reject;
      });
    });
  await Promise.all(promises);

  // delete localStorage
  localStorage.clear();

  // reload page
  location.reload();
}

export function errorLogWithToast(message: string, error?: unknown) {
  console.error(...[message, error].filter(Boolean));
  toast.error(message);
}
