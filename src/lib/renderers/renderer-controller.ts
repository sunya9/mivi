import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { MidiTrack } from "@/lib/midi/midi";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { drawFrame } from "@/lib/renderers/draw-frame";
import { Renderer, type RendererContext } from "@/lib/renderers/renderer";
import { RendererConfig, RendererType } from "@/lib/renderers/renderer-config";

// Holds what the preview needs between frames: the latest config, the bitmap and a renderer
// that survives config edits so its per-instance caches are kept
export class RendererController {
  readonly #context: RendererContext;
  #renderer?: Renderer;
  #rendererConfig?: RendererConfig;
  #backgroundImageBitmap?: ImageBitmap;
  #currentRendererType?: RendererType;

  constructor(context: RendererContext) {
    this.#context = context;
  }

  setRendererConfig(rendererConfig: RendererConfig) {
    this.#rendererConfig = rendererConfig;

    if (this.#currentRendererType !== rendererConfig.type || !this.#renderer) {
      this.#currentRendererType = rendererConfig.type;
      this.#renderer = createRenderer(rendererConfig.type, this.#context);
    }
  }

  setBackgroundImageBitmap(backgroundImageBitmap?: ImageBitmap) {
    this.#backgroundImageBitmap = backgroundImageBitmap;
  }

  render(tracks: MidiTrack[], currentTime: number, frequencyData?: FrequencyData | null) {
    const config = this.#rendererConfig;
    const renderer = this.#renderer;
    if (!config || !renderer) return;
    const ctx = this.#context;
    const { resolution } = config;

    ctx.save();
    ctx.setTransform(
      ctx.canvas.width / resolution.width,
      0,
      0,
      ctx.canvas.height / resolution.height,
      0,
      0,
    );
    drawFrame(ctx, {
      config,
      renderer,
      tracks,
      currentTime,
      frequencyData,
      backgroundImageBitmap: this.#backgroundImageBitmap,
    });
    ctx.restore();
  }
}
