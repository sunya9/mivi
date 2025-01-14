import { PlaybackState } from "@/types/player";
import { MidiTrack, MidiTracks } from "../types/midi";
import { RendererConfig } from "@/types/renderer";

export abstract class Renderer {
  constructor(
    protected readonly ctx:
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D,
    protected readonly config: RendererConfig,
  ) {}

  renderCommonVisual() {
    const {
      canvas: { width, height },
    } = this.ctx;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
  }
  abstract render(tracks: MidiTrack[], playbackState: PlaybackState): void;
  renderThumbnail(
    tracks: MidiTracks | undefined,
    position: {
      duration: number | undefined;
      currentTime: number | undefined;
    },
  ) {
    this.render(tracks?.tracks || [], {
      duration: position.duration || 0,
      currentTime: position.currentTime || 0,
    });
  }
}

export type RendererCreator = (
  ctx: CanvasRenderingContext2D,
  rendererConfig: RendererConfig,
) => Renderer;
