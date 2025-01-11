import {
  ParticlesRenderer,
  PianoRollRenderer,
  WaveformRenderer,
} from "@/renderers";
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
    case "waveform":
      return new WaveformRenderer(ctx, config);
    case "particles":
      return new ParticlesRenderer(ctx, config);
    default:
      throw new Error(`Unknown renderer type: ${config}`);
  }
}
