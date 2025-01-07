import { PlaybackState } from "@/types/player";
import { MidiTrack } from "./midi";

export abstract class Renderer {
  constructor(protected readonly ctx: CanvasRenderingContext2D) {}
  clear() {
    const {
      canvas: { width, height },
    } = this.ctx;
    this.ctx.clearRect(0, 0, width, height);
  }
  abstract render(tracks: MidiTrack[], playbackState: PlaybackState): void;
}
