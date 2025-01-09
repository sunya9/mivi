import {
  ParticlesRenderer,
  PianoRollRenderer,
  WaveformRenderer,
} from "@/renderers";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getRendererFromName = (
  name: string,
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
) => {
  switch (name) {
    case "pianoRoll":
      return new PianoRollRenderer(context);
    case "waveform":
      return new WaveformRenderer(context);
    case "particles":
      return new ParticlesRenderer(context);
    default:
      throw new Error("Invalid renderer name");
  }
};
