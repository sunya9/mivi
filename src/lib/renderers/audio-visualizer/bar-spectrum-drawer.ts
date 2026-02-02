import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type {
  AudioVisualizerConfig,
  RendererContext,
} from "@/lib/renderers/renderer";
import type { AudioVisualizerDrawer } from "./types";
import { getGradientCoords } from "./gradient-utils";

/**
 * Draws a bar spectrum visualization based on frequency data.
 * Supports gradient colors, rounded/sharp bar styles, and various positions.
 */
export class BarSpectrumDrawer implements AudioVisualizerDrawer {
  readonly #ctx: RendererContext;
  #config: AudioVisualizerConfig;

  constructor(ctx: RendererContext, config: AudioVisualizerConfig) {
    this.#ctx = ctx;
    this.#config = config;
  }

  setConfig(config: AudioVisualizerConfig): void {
    this.#config = config;
  }

  /**
   * Draw the bar spectrum visualization.
   * @param frequencyData - Frequency data from AudioAnalyzer
   */
  draw(frequencyData: FrequencyData): void {
    const { canvas } = this.#ctx;
    const { width: canvasWidth, height: canvasHeight } = canvas;

    const {
      barCount,
      barGap,
      barPadding,
      barMinHeight,
      barStyle,
      useGradient,
      gradientDirection,
      gradientStartColor,
      gradientEndColor,
      singleColor,
      barOpacity,
      position,
      height: heightPercent,
      mirror,
      mirrorOpacity,
      minFrequency,
      maxFrequency,
    } = this.#config;

    // Calculate visualizer area
    const visualizerHeight = (canvasHeight * heightPercent) / 100;

    // Calculate bar dimensions to fill the width
    const paddingWidth = (canvasWidth * barPadding) / 100;
    const availableWidth = canvasWidth - paddingWidth * 2;
    const totalGapWidth = (availableWidth * barGap) / 100;
    const totalBarWidth = availableWidth - totalGapWidth;
    const barWidth = totalBarWidth / barCount;
    const gapWidth = barCount > 1 ? totalGapWidth / (barCount - 1) : 0;
    const startX = paddingWidth;

    // Calculate Y position based on position setting
    // Use Math.round to avoid subpixel gaps
    let baseY: number;
    switch (position) {
      case "bottom":
        baseY = canvasHeight;
        break;
      case "top":
        baseY = 0;
        break;
      case "center":
        baseY = canvasHeight / 2;
        break;
    }

    // Create gradient if enabled
    let fillStyle: string | CanvasGradient;
    if (useGradient) {
      const [x0, y0, x1, y1] = getGradientCoords(
        gradientDirection,
        canvasWidth,
        canvasHeight,
      );
      const gradient = this.#ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, gradientStartColor);
      gradient.addColorStop(1, gradientEndColor);
      fillStyle = gradient;
    } else {
      fillStyle = singleColor;
    }

    this.#ctx.save();
    this.#ctx.globalAlpha = barOpacity;
    this.#ctx.fillStyle = fillStyle;

    // Get frequency bins for the specified range
    const binsPerBar = this.#calculateBinsPerBar(
      frequencyData,
      barCount,
      minFrequency,
      maxFrequency,
    );

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const amplitude = binsPerBar[i];
      // Normalize amplitude (0-255) to height
      const barHeight = Math.max(
        barMinHeight,
        (amplitude / 255) * visualizerHeight,
      );

      const x = startX + i * (barWidth + gapWidth);

      this.#drawBar(
        x,
        baseY,
        barWidth,
        barHeight,
        barStyle,
        position,
        mirror,
        mirrorOpacity,
      );
    }

    this.#ctx.restore();
  }

  /**
   * Calculate average amplitude for each bar from frequency bins.
   */
  #calculateBinsPerBar(
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

    // Use logarithmic scale for more natural frequency distribution
    const logMin = Math.log10(minFrequency);
    const logMax = Math.log10(maxFrequency);
    const logStep = (logMax - logMin) / barCount;

    for (let i = 0; i < barCount; i++) {
      // Calculate frequency range for this bar using log scale
      const freqStart = Math.pow(10, logMin + i * logStep);
      const freqEnd = Math.pow(10, logMin + (i + 1) * logStep);

      // Convert to bin indices
      const binStart = Math.floor(
        (freqStart / nyquistFrequency) * frequencyBinCount,
      );
      const binEnd = Math.ceil(
        (freqEnd / nyquistFrequency) * frequencyBinCount,
      );

      // Average the bins in this range
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

  /**
   * Draw a single bar with the specified style.
   */
  #drawBar(
    x: number,
    baseY: number,
    width: number,
    height: number,
    style: "rounded" | "sharp",
    position: "bottom" | "top" | "center",
    mirror: boolean,
    mirrorOpacity: number,
  ): void {
    // cornerRadius: which corners to round [topLeft, topRight, bottomRight, bottomLeft]
    const drawSingleBar = (
      y: number,
      h: number,
      cornerRadius?: [number, number, number, number],
    ) => {
      if (style === "rounded") {
        const radius = Math.min(width / 2, Math.abs(h) / 2, 4);
        const radii = cornerRadius ?? [radius, radius, radius, radius];
        this.#drawRoundedRect(x, y, width, h, radii);
      } else {
        this.#ctx.fillRect(x, y, width, h);
      }
    };

    const radius = Math.min(width / 2, height / 2, 4);

    switch (position) {
      case "bottom":
        // Rounded top, flat bottom
        drawSingleBar(baseY - height, height, [radius, radius, 0, 0]);
        if (mirror) {
          // Mirror sticks to top of canvas, pointing down
          this.#ctx.save();
          this.#ctx.globalAlpha *= mirrorOpacity;
          drawSingleBar(0, height, [0, 0, radius, radius]);
          this.#ctx.restore();
        }
        break;
      case "top":
        // Flat top, rounded bottom
        drawSingleBar(baseY, height, [0, 0, radius, radius]);
        if (mirror) {
          // Mirror sticks to bottom of canvas, pointing up
          const canvasHeight = this.#ctx.canvas.height;
          this.#ctx.save();
          this.#ctx.globalAlpha *= mirrorOpacity;
          drawSingleBar(canvasHeight - height, height, [radius, radius, 0, 0]);
          this.#ctx.restore();
        }
        break;
      case "center": {
        // Main bar: rounded top, flat bottom (touching center)
        drawSingleBar(baseY - height, height, [radius, radius, 0, 0]);
        if (mirror) {
          // Mirror: flat top (touching center), rounded bottom
          this.#ctx.save();
          this.#ctx.globalAlpha *= mirrorOpacity;
          drawSingleBar(baseY, height, [0, 0, radius, radius]);
          this.#ctx.restore();
        }
        break;
      }
    }
  }

  /**
   * Draw a rounded rectangle with individual corner radii.
   * @param radii - [topLeft, topRight, bottomRight, bottomLeft]
   */
  #drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: [number, number, number, number],
  ): void {
    const ctx = this.#ctx;
    ctx.beginPath();
    // Use roundRect which is supported in modern browsers
    // Cast to CanvasRenderingContext2D to access roundRect method
    (ctx as CanvasRenderingContext2D).roundRect(x, y, width, height, radii);
    ctx.closePath();
    ctx.fill();
  }
}
