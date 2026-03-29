import { MidiTrack } from "@/lib/midi/midi";
import { getRendererFromConfig } from "@/lib/renderers/get-renderer";
import { Renderer, RendererConfig, RendererType, Resolution } from "@/lib/renderers/renderer";
import { AudioVisualizerOverlay } from "@/lib/renderers/audio-visualizer-overlay";
import { BackgroundRenderer } from "@/lib/renderers/background-renderer";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";

export class RendererController {
  #context: CanvasRenderingContext2D;
  #backgroundRenderer?: BackgroundRenderer;
  #audioVisualizerOverlay?: AudioVisualizerOverlay;

  constructor(context: CanvasRenderingContext2D) {
    this.#context = context;
  }

  #renderer?: Renderer;
  #rendererConfig?: RendererConfig;
  #backgroundImageBitmap?: ImageBitmap;
  #currentRendererType?: RendererType;
  #currentResolution?: Resolution;

  setRendererConfig(rendererConfig: RendererConfig) {
    const previousType = this.#currentRendererType;
    this.#rendererConfig = rendererConfig;

    if (previousType !== rendererConfig.type || !this.#renderer) {
      this.#buildRenderer();
    } else {
      this.#renderer.setConfig(rendererConfig);
    }

    // Update or create background renderer
    if (this.#backgroundRenderer) {
      this.#backgroundRenderer.setConfig(rendererConfig);
    } else {
      this.#backgroundRenderer = new BackgroundRenderer(
        this.#context,
        rendererConfig,
        this.#backgroundImageBitmap,
      );
    }

    // Update or recreate audio visualizer overlay
    if (this.#audioVisualizerOverlay) {
      this.#audioVisualizerOverlay.setConfig(rendererConfig.audioVisualizerConfig);
    }
    if (!this.#audioVisualizerOverlay || this.#currentResolution !== rendererConfig.resolution) {
      this.#audioVisualizerOverlay = new AudioVisualizerOverlay(
        this.#context,
        rendererConfig.audioVisualizerConfig,
        rendererConfig.resolution,
      );
      this.#currentResolution = rendererConfig.resolution;
    }
  }

  setBackgroundImageBitmap(backgroundImageBitmap?: ImageBitmap) {
    this.#backgroundImageBitmap = backgroundImageBitmap;

    if (this.#backgroundRenderer) {
      this.#backgroundRenderer.setBackgroundImageBitmap(backgroundImageBitmap);
    }
  }

  #buildRenderer() {
    if (!this.#rendererConfig) return;
    this.#currentRendererType = this.#rendererConfig.type;
    this.#renderer = getRendererFromConfig(this.#context, this.#rendererConfig);
  }

  render(tracks: MidiTrack[], currentTime: number, frequencyData?: FrequencyData | null) {
    if (!this.#rendererConfig) return;
    const { resolution } = this.#rendererConfig;
    const ctx = this.#context;
    const layer = this.#rendererConfig.audioVisualizerLayer ?? "front";

    ctx.save();
    ctx.setTransform(
      ctx.canvas.width / resolution.width,
      0,
      0,
      ctx.canvas.height / resolution.height,
      0,
      0,
    );

    // 1. Render background (always first)
    this.#backgroundRenderer?.render();

    // 2. Render audio visualizer in back layer (under MIDI)
    if (layer === "back" && frequencyData) {
      this.#audioVisualizerOverlay?.render(frequencyData);
    }

    // 3. Render MIDI visualizer
    this.#renderer?.render(tracks, currentTime);

    // 4. Render audio visualizer in front layer (over MIDI)
    if (layer === "front" && frequencyData) {
      this.#audioVisualizerOverlay?.render(frequencyData);
    }

    ctx.restore();
  }
}
