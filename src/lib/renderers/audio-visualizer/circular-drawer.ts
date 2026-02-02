import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type {
  AudioVisualizerConfig,
  RendererContext,
} from "@/lib/renderers/renderer";
import type { AudioVisualizerDrawer } from "./types";

/**
 * Draws a circular/radial visualization with bars emanating from a center point.
 * Creates a sun-burst effect based on frequency data.
 */
export class CircularDrawer implements AudioVisualizerDrawer {
  readonly #ctx: RendererContext;
  #config: AudioVisualizerConfig;

  constructor(ctx: RendererContext, config: AudioVisualizerConfig) {
    this.#ctx = ctx;
    this.#config = config;
  }

  setConfig(config: AudioVisualizerConfig): void {
    this.#config = config;
  }

  draw(frequencyData: FrequencyData): void {
    const { canvas } = this.#ctx;
    const { width: canvasWidth, height: canvasHeight } = canvas;

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
    const maxRadius =
      (Math.min(canvasWidth, canvasHeight) * heightPercent) / 100 / 2;
    const innerRadius = maxRadius * 0.3;

    // Calculate bar width based on circumference and bar count
    const circumference = 2 * Math.PI * innerRadius;
    const barWidth = Math.max(1, (circumference / barCount) * 0.6);

    this.#ctx.save();
    this.#ctx.globalAlpha = barOpacity;

    const amplitudes = this.#calculateAmplitudes(
      frequencyData,
      barCount,
      minFrequency,
      maxFrequency,
    );

    const angleStep = (Math.PI * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
      const amplitude = amplitudes[i];
      const barHeight = Math.max(
        barMinHeight,
        (amplitude / 255) * (maxRadius - innerRadius),
      );

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

  #calculateAmplitudes(
    frequencyData: FrequencyData,
    barCount: number,
    minFrequency: number,
    maxFrequency: number,
  ): number[] {
    const {
      frequencyData: data,
      frequencyBinCount,
      nyquistFrequency,
    } = frequencyData;
    const result: number[] = [];

    const logMin = Math.log10(minFrequency);
    const logMax = Math.log10(maxFrequency);
    const logStep = (logMax - logMin) / barCount;

    for (let i = 0; i < barCount; i++) {
      const freqStart = Math.pow(10, logMin + i * logStep);
      const freqEnd = Math.pow(10, logMin + (i + 1) * logStep);

      const binStart = Math.floor(
        (freqStart / nyquistFrequency) * frequencyBinCount,
      );
      const binEnd = Math.ceil(
        (freqEnd / nyquistFrequency) * frequencyBinCount,
      );

      let sum = 0;
      let count = 0;
      for (
        let j = Math.max(0, binStart);
        j < Math.min(frequencyBinCount, binEnd);
        j++
      ) {
        sum += data[j];
        count++;
      }

      result.push(count > 0 ? sum / count : 0);
    }

    return result;
  }
}
