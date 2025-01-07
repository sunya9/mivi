import { PlaybackState } from "@/types/player";
import { MidiTrack } from "./midi";

export type VisualizerRendererType = "pianoRoll" | "waveform" | "particles";

export abstract class Renderer {
  constructor(protected readonly ctx: CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio;
    ctx.scale(dpr, dpr);
  }
  clear() {
    const {
      canvas: { width, height },
    } = this.ctx;
    this.ctx.clearRect(0, 0, width, height);
  }
  abstract render(tracks: MidiTrack[], playbackState: PlaybackState): void;
}

export interface RendererSettings {
  style: "pianoRoll" | "particles" | "waveform";
}
