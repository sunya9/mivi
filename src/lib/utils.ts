import { PianoRollRenderer } from "@/renderers";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RendererConfig, RendererContext } from "@/types/renderer";
import { Renderer } from "@/renderers/Renderer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function getRendererFromConfig(
  ctx: RendererContext,
  config: RendererConfig,
): Renderer {
  switch (config.type) {
    case "pianoRoll":
      return new PianoRollRenderer(ctx, config);
    default:
      throw new Error(`Unknown renderer type: ${config}`);
  }
}

export async function resetConfig() {
  // delete indexedDB databases
  const databases = await indexedDB.databases();
  const promises = databases.map((db) => {
    if (!db.name) return Promise.resolve();
    const req = indexedDB.deleteDatabase(db.name);
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
