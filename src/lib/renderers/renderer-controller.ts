import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { MidiTrack } from "@/lib/midi/midi";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer/audio-visualizer";
import { drawBackground } from "@/lib/renderers/background";
import { createRenderer } from "@/lib/renderers/create-renderer";
import { Renderer, type RendererContext } from "@/lib/renderers/renderer";
import { RendererConfig, RendererType } from "@/lib/renderers/renderer-config";

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
    if (!config) return;
    const { resolution, audioVisualizerConfig } = config;
    const ctx = this.#context;
    const layer = config.audioVisualizerLayer ?? "front";

    ctx.save();
    ctx.setTransform(
      ctx.canvas.width / resolution.width,
      0,
      0,
      ctx.canvas.height / resolution.height,
      0,
      0,
    );

    drawBackground(ctx, config, this.#backgroundImageBitmap);

    if (layer === "back" && frequencyData) {
      drawAudioVisualizer(ctx, frequencyData, audioVisualizerConfig, resolution);
    }

    this.#renderer?.(tracks, currentTime, config);

    if (layer === "front" && frequencyData) {
      drawAudioVisualizer(ctx, frequencyData, audioVisualizerConfig, resolution);
    }

    ctx.restore();
  }
}
