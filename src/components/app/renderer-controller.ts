import { MidiTrack } from "@/lib/midi/midi";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import {
  Renderer,
  RendererConfig,
  RendererType,
} from "@/lib/renderers/renderer";

export class RendererController {
  private context: CanvasRenderingContext2D;
  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  private renderer?: Renderer;
  private rendererConfig?: RendererConfig;
  private backgroundImageBitmap?: ImageBitmap;
  private currentRendererType?: RendererType;

  setRendererConfig(rendererConfig: RendererConfig) {
    const previousType = this.currentRendererType;
    this.rendererConfig = rendererConfig;

    if (previousType !== rendererConfig.type || !this.renderer) {
      this.buildRenderer();
    } else {
      this.renderer.setConfig(rendererConfig);
    }
  }

  setBackgroundImageBitmap(backgroundImageBitmap?: ImageBitmap) {
    this.backgroundImageBitmap = backgroundImageBitmap;

    if (this.renderer) {
      this.renderer.setBackgroundImageBitmap(backgroundImageBitmap);
    }
  }

  private buildRenderer() {
    if (!this.rendererConfig) return;
    this.currentRendererType = this.rendererConfig.type;
    this.renderer = getRendererFromConfig(
      this.context,
      this.rendererConfig,
      this.backgroundImageBitmap,
    );
  }

  render(tracks: MidiTrack[], currentTime: number) {
    this.renderer?.render(tracks, currentTime);
  }
}
