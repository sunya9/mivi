import { PianoRollRenderer } from "@/lib/renderers";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Renderer,
  RendererConfig,
  RendererContext,
} from "@/lib/renderers/renderer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getRendererFromConfig(
  ctx: RendererContext,
  config: RendererConfig,
  backgroundImageBitmap?: ImageBitmap,
): Renderer {
  switch (config.type) {
    case "pianoRoll":
      return new PianoRollRenderer(ctx, config, backgroundImageBitmap);
    default: {
      const configType = config.type satisfies never;
      throw new Error(`Unknown renderer type: ${String(configType)}`);
    }
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
