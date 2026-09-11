import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { AudioVisualizerConfig, RendererContext, Resolution } from "@/lib/renderers/renderer";

import { calculateBandAmplitudes } from "./band-amplitudes";
import { getGradientCoords } from "./gradient-utils";

interface Point {
  x: number;
  y: number;
}

function generatePoints(
  amplitudes: number[],
  barCount: number,
  canvasWidth: number,
  baseY: number,
  visualizerHeight: number,
  position: AudioVisualizerConfig["position"],
): Point[] {
  const points: Point[] = [];

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

function traceCurve(ctx: RendererContext, points: Point[], tension: number): void {
  if (tension === 0 || points.length < 3) {
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    return;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function drawLinePath(ctx: RendererContext, points: Point[], tension: number): void {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  traceCurve(ctx, points, tension);
  ctx.stroke();
}

function drawFilledPath(
  ctx: RendererContext,
  points: Point[],
  tension: number,
  baseY: number,
): void {
  if (points.length < 2) return;

  ctx.beginPath();

  // Start from baseline at first point
  ctx.moveTo(points[0].x, baseY);
  ctx.lineTo(points[0].x, points[0].y);
  traceCurve(ctx, points, tension);

  // Close the path back to baseline
  ctx.lineTo(points[points.length - 1].x, baseY);
  ctx.closePath();
  ctx.fill();
}

interface SpectrumShape {
  points: Point[];
  tension: number;
  baseY: number;
  fillStyle: string | CanvasGradient;
  stroke: boolean;
  strokeOpacity: number;
  fill: boolean;
  fillOpacity: number;
}

function drawSpectrumShape(ctx: RendererContext, baseOpacity: number, shape: SpectrumShape) {
  const { points, tension, baseY, fillStyle, stroke, strokeOpacity, fill, fillOpacity } = shape;

  if (fill && stroke) {
    // Use composite operation to clip fill to stroke area
    ctx.save();

    // Draw stroke first to create the "mask"
    ctx.globalAlpha = baseOpacity * strokeOpacity;
    drawLinePath(ctx, points, tension);

    // Draw fill only where stroke exists
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = baseOpacity * fillOpacity;
    ctx.fillStyle = fillStyle;
    drawFilledPath(ctx, points, tension, baseY);

    ctx.restore();

    // Draw stroke again on top for clean edges
    ctx.globalAlpha = baseOpacity * strokeOpacity;
    drawLinePath(ctx, points, tension);
  } else if (fill) {
    ctx.save();
    ctx.globalAlpha = baseOpacity * fillOpacity;
    ctx.fillStyle = fillStyle;
    drawFilledPath(ctx, points, tension, baseY);
    ctx.restore();
  } else if (stroke) {
    ctx.globalAlpha = baseOpacity * strokeOpacity;
    drawLinePath(ctx, points, tension);
  }
}

// Connects the frequency peaks into a mountain-like silhouette
export function drawLineSpectrum(
  ctx: RendererContext,
  frequencyData: FrequencyData,
  config: AudioVisualizerConfig,
  resolution: Resolution,
): void {
  const canvasWidth = resolution.width;
  const canvasHeight = resolution.height;

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
  } = config;

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
    const [x0, y0, x1, y1] = getGradientCoords(gradientDirection, canvasWidth, canvasHeight);
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, gradientStartColor);
    gradient.addColorStop(1, gradientEndColor);
    fillStyle = gradient;
  } else {
    fillStyle = singleColor;
  }

  ctx.save();
  ctx.globalAlpha = barOpacity;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const amplitudes = calculateBandAmplitudes(frequencyData, barCount, minFrequency, maxFrequency);

  const points = generatePoints(
    amplitudes,
    barCount,
    canvasWidth,
    baseY,
    visualizerHeight,
    position,
  );

  const shape = { tension, fillStyle, stroke, strokeOpacity, fill, fillOpacity };
  drawSpectrumShape(ctx, barOpacity, { ...shape, points, baseY });

  if (mirror) {
    ctx.save();

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
    const mirrorBaseY = position === "bottom" ? 0 : position === "top" ? canvasHeight : baseY;

    drawSpectrumShape(ctx, barOpacity * mirrorOpacity, {
      ...shape,
      points: mirrorPoints,
      baseY: mirrorBaseY,
    });
    ctx.restore();
  }

  ctx.restore();
}
