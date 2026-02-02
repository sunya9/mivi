import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type {
  AudioVisualizerConfig,
  RendererContext,
} from "@/lib/renderers/renderer";
import type { AudioVisualizerDrawer } from "./types";
import { getGradientCoords } from "./gradient-utils";

/**
 * Draws a line spectrum visualization connecting frequency peaks with lines.
 * Creates a mountain-like silhouette from the frequency data.
 */
export class LineSpectrumDrawer implements AudioVisualizerDrawer {
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
      lineSpectrumConfig: {
        lineWidth,
        tension,
        stroke,
        strokeColor,
        strokeOpacity,
        fill,
        fillOpacity,
      },
    } = this.#config;

    const visualizerHeight = (canvasHeight * heightPercent) / 100;

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

    // Create fill style (gradient or single color)
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
    this.#ctx.strokeStyle = strokeColor;
    this.#ctx.lineWidth = lineWidth;
    this.#ctx.lineJoin = "round";
    this.#ctx.lineCap = "round";

    const amplitudes = this.#calculateAmplitudes(
      frequencyData,
      barCount,
      minFrequency,
      maxFrequency,
    );

    const points = this.#generatePoints(
      amplitudes,
      barCount,
      canvasWidth,
      baseY,
      visualizerHeight,
      position,
    );

    if (fill && stroke) {
      // Use composite operation to clip fill to stroke area
      this.#ctx.save();

      // Draw stroke first to create the "mask"
      this.#ctx.globalAlpha = barOpacity * strokeOpacity;
      this.#drawLinePath(points, tension);

      // Draw fill only where stroke exists
      this.#ctx.globalCompositeOperation = "source-atop";
      this.#ctx.globalAlpha = barOpacity * fillOpacity;
      this.#ctx.fillStyle = fillStyle;
      this.#drawFilledPath(points, tension, baseY);

      this.#ctx.restore();

      // Draw stroke again on top for clean edges
      this.#ctx.globalAlpha = barOpacity * strokeOpacity;
      this.#drawLinePath(points, tension);
    } else if (fill) {
      // Fill only (no stroke)
      this.#ctx.save();
      this.#ctx.globalAlpha = barOpacity * fillOpacity;
      this.#ctx.fillStyle = fillStyle;
      this.#drawFilledPath(points, tension, baseY);
      this.#ctx.restore();
    } else if (stroke) {
      // Stroke only
      this.#ctx.globalAlpha = barOpacity * strokeOpacity;
      this.#drawLinePath(points, tension);
    }

    if (mirror) {
      this.#ctx.save();

      const mirrorBase = barOpacity * mirrorOpacity;

      // Calculate mirror points - reflection sticks to opposite edge
      const mirrorPoints = points.map((p) => {
        const barHeight = Math.abs(baseY - p.y);
        let mirrorY: number;
        if (position === "center") {
          // Reflect across baseline
          mirrorY = baseY + barHeight;
        } else if (position === "bottom") {
          // Stick to top of canvas, pointing downward
          mirrorY = barHeight;
        } else {
          // Top: stick to bottom of canvas, pointing upward
          mirrorY = canvasHeight - barHeight;
        }
        return { x: p.x, y: mirrorY };
      });

      // Calculate mirror baseline for fill
      const mirrorBaseY =
        position === "bottom" ? 0 : position === "top" ? canvasHeight : baseY;

      if (fill && stroke) {
        this.#ctx.save();

        this.#ctx.globalAlpha = mirrorBase * strokeOpacity;
        this.#drawLinePath(mirrorPoints, tension);

        this.#ctx.globalCompositeOperation = "source-atop";
        this.#ctx.globalAlpha = mirrorBase * fillOpacity;
        this.#ctx.fillStyle = fillStyle;
        this.#drawFilledPath(mirrorPoints, tension, mirrorBaseY);

        this.#ctx.restore();

        this.#ctx.globalAlpha = mirrorBase * strokeOpacity;
        this.#drawLinePath(mirrorPoints, tension);
      } else if (fill) {
        this.#ctx.save();
        this.#ctx.globalAlpha = mirrorBase * fillOpacity;
        this.#ctx.fillStyle = fillStyle;
        this.#drawFilledPath(mirrorPoints, tension, mirrorBaseY);
        this.#ctx.restore();
      } else if (stroke) {
        this.#ctx.globalAlpha = mirrorBase * strokeOpacity;
        this.#drawLinePath(mirrorPoints, tension);
      }
      this.#ctx.restore();
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

  #generatePoints(
    amplitudes: number[],
    barCount: number,
    canvasWidth: number,
    baseY: number,
    visualizerHeight: number,
    position: "bottom" | "top" | "center",
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < barCount; i++) {
      const amplitude = amplitudes[i];
      const barHeight = (amplitude / 255) * visualizerHeight;
      const x = (i / (barCount - 1)) * canvasWidth;

      let y: number;
      switch (position) {
        case "bottom":
          y = baseY - barHeight;
          break;
        case "top":
          y = barHeight;
          break;
        case "center":
          y = baseY - barHeight / 2;
          break;
      }

      points.push({ x, y });
    }

    return points;
  }

  #drawLinePath(points: { x: number; y: number }[], tension: number): void {
    if (points.length < 2) return;

    this.#ctx.beginPath();
    this.#ctx.moveTo(points[0].x, points[0].y);

    if (tension === 0 || points.length < 3) {
      for (let i = 1; i < points.length; i++) {
        this.#ctx.lineTo(points[i].x, points[i].y);
      }
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
        const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
        const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
        const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

        this.#ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    }

    this.#ctx.stroke();
  }

  #drawFilledPath(
    points: { x: number; y: number }[],
    tension: number,
    baseY: number,
  ): void {
    if (points.length < 2) return;

    this.#ctx.beginPath();

    // Start from baseline at first point
    this.#ctx.moveTo(points[0].x, baseY);
    this.#ctx.lineTo(points[0].x, points[0].y);

    // Draw the curve (same as stroke path)
    if (tension === 0 || points.length < 3) {
      for (let i = 1; i < points.length; i++) {
        this.#ctx.lineTo(points[i].x, points[i].y);
      }
    } else {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
        const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
        const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
        const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

        this.#ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    }

    // Close the path back to baseline
    this.#ctx.lineTo(points[points.length - 1].x, baseY);
    this.#ctx.closePath();
    this.#ctx.fill();
  }
}
