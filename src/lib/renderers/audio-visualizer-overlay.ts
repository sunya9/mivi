import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { AudioVisualizerConfig, RendererContext } from "./renderer";
import { BarSpectrumDrawer } from "./audio-visualizer/bar-spectrum-drawer";
import { LineSpectrumDrawer } from "./audio-visualizer/line-spectrum-drawer";
import { CircularDrawer } from "./audio-visualizer/circular-drawer";

/**
 * Overlay class for rendering audio visualizations on top of existing renderers.
 * Does not extend Renderer class as it's an overlay, not a standalone renderer.
 */
export class AudioVisualizerOverlay {
  readonly #ctx: RendererContext;
  readonly #barSpectrumDrawer: BarSpectrumDrawer;
  readonly #lineSpectrumDrawer: LineSpectrumDrawer;
  readonly #circularDrawer: CircularDrawer;
  #config: AudioVisualizerConfig;

  constructor(ctx: RendererContext, config: AudioVisualizerConfig) {
    this.#ctx = ctx;
    this.#config = config;
    this.#barSpectrumDrawer = new BarSpectrumDrawer(ctx, config);
    this.#lineSpectrumDrawer = new LineSpectrumDrawer(ctx, config);
    this.#circularDrawer = new CircularDrawer(ctx, config);
  }

  setConfig(config: AudioVisualizerConfig): void {
    this.#config = config;
    this.#barSpectrumDrawer.setConfig(config);
    this.#lineSpectrumDrawer.setConfig(config);
    this.#circularDrawer.setConfig(config);
  }

  /**
   * Render the audio visualizer overlay.
   * Should be called after the main renderer's render() method.
   * @param frequencyData - Frequency data from AudioAnalyzer or pre-computed data
   */
  render(frequencyData: FrequencyData | null): void {
    if (this.#config.style === "none" || !frequencyData) {
      return;
    }

    this.#ctx.save();

    switch (this.#config.style) {
      case "bars":
        this.#barSpectrumDrawer.draw(frequencyData);
        break;
      case "lineSpectrum":
        this.#lineSpectrumDrawer.draw(frequencyData);
        break;
      case "circular":
        this.#circularDrawer.draw(frequencyData);
        break;
    }

    this.#ctx.restore();
  }
}
