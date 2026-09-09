import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { AudioVisualizerConfig, RendererContext, Resolution } from "@/lib/renderers/renderer";

import { calculateBandAmplitudes } from "./band-amplitudes";
import type { AudioVisualizerDrawer } from "./types";

/**
 * Draws a circular/radial visualization with bars emanating from a center point.
 * Creates a sun-burst effect based on frequency data.
 */
export class CircularDrawer implements AudioVisualizerDrawer {
  readonly #ctx: RendererContext;
  #config: AudioVisualizerConfig;
  readonly #resolution: Resolution;

  constructor(ctx: RendererContext, config: AudioVisualizerConfig, resolution: Resolution) {
    this.#ctx = ctx;
    this.#config = config;
    this.#resolution = resolution;
  }

  setConfig(config: AudioVisualizerConfig): void {
    this.#config = config;
  }

  draw(frequencyData: FrequencyData): void {
    const canvasWidth = this.#resolution.width;
    const canvasHeight = this.#resolution.height;

    const {
      barCount,
      barMinHeight,
      barStyle,
      useGradient,
      gradientStartColor,
      gradientEndColor,
      singleColor,
      barOpacity,
      height: heightPercent,
      mirror,
      mirrorOpacity,
      minFrequency,
      maxFrequency,
    } = this.#config;

    // Calculate center and radius
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = (Math.min(canvasWidth, canvasHeight) * heightPercent) / 100 / 2;
    const innerRadius = maxRadius * 0.3;

    // Calculate bar width based on circumference and bar count
    const circumference = 2 * Math.PI * innerRadius;
    const barWidth = Math.max(1, (circumference / barCount) * 0.6);

    this.#ctx.save();
    this.#ctx.globalAlpha = barOpacity;

    const amplitudes = calculateBandAmplitudes(frequencyData, barCount, minFrequency, maxFrequency);

    const angleStep = (Math.PI * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
      const amplitude = amplitudes[i];
      const barHeight = Math.max(barMinHeight, (amplitude / 255) * (maxRadius - innerRadius));

      const angle = i * angleStep - Math.PI / 2; // Start from top

      // Calculate bar position
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * (innerRadius + barHeight);
      const y2 = centerY + Math.sin(angle) * (innerRadius + barHeight);

      // Create gradient for this bar
      let strokeStyle: string | CanvasGradient;
      if (useGradient) {
        const gradient = this.#ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, gradientStartColor);
        gradient.addColorStop(1, gradientEndColor);
        strokeStyle = gradient;
      } else {
        strokeStyle = singleColor;
      }

      this.#ctx.strokeStyle = strokeStyle;
      this.#ctx.lineWidth = barWidth;
      this.#ctx.lineCap = barStyle === "rounded" ? "round" : "butt";

      this.#ctx.beginPath();
      this.#ctx.moveTo(x1, y1);
      this.#ctx.lineTo(x2, y2);
      this.#ctx.stroke();

      // Draw mirror (inner reflection)
      if (mirror) {
        const mirrorHeight = barHeight;
        const mx1 = centerX + Math.cos(angle) * (innerRadius - mirrorHeight);
        const my1 = centerY + Math.sin(angle) * (innerRadius - mirrorHeight);
        const mx2 = centerX + Math.cos(angle) * innerRadius;
        const my2 = centerY + Math.sin(angle) * innerRadius;

        this.#ctx.save();
        this.#ctx.globalAlpha *= mirrorOpacity;
        this.#ctx.beginPath();
        this.#ctx.moveTo(mx1, my1);
        this.#ctx.lineTo(mx2, my2);
        this.#ctx.stroke();
        this.#ctx.restore();
      }
    }

    this.#ctx.restore();
  }
}
