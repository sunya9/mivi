import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { RendererContext } from "@/lib/renderers/renderer";
import type { AudioVisualizerConfig } from "@/lib/renderers/renderer-config";
import type { Resolution } from "@/lib/renderers/resolution";

import { calculateBandAmplitudes } from "./band-amplitudes";

// Bars radiate from a center point, giving a sun-burst effect
export function drawCircular(
  ctx: RendererContext,
  frequencyData: FrequencyData,
  config: AudioVisualizerConfig,
  resolution: Resolution,
): void {
  const canvasWidth = resolution.width;
  const canvasHeight = resolution.height;

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
  } = config;

  // Calculate center and radius
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const maxRadius = (Math.min(canvasWidth, canvasHeight) * heightPercent) / 100 / 2;
  const innerRadius = maxRadius * 0.3;

  // Calculate bar width based on circumference and bar count
  const circumference = 2 * Math.PI * innerRadius;
  const barWidth = Math.max(1, (circumference / barCount) * 0.6);

  ctx.save();
  ctx.globalAlpha = barOpacity;

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
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, gradientStartColor);
      gradient.addColorStop(1, gradientEndColor);
      strokeStyle = gradient;
    } else {
      strokeStyle = singleColor;
    }

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = barWidth;
    ctx.lineCap = barStyle === "rounded" ? "round" : "butt";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw mirror (inner reflection)
    if (mirror) {
      const mirrorHeight = barHeight;
      const mx1 = centerX + Math.cos(angle) * (innerRadius - mirrorHeight);
      const my1 = centerY + Math.sin(angle) * (innerRadius - mirrorHeight);
      const mx2 = centerX + Math.cos(angle) * innerRadius;
      const my2 = centerY + Math.sin(angle) * innerRadius;

      ctx.save();
      ctx.globalAlpha *= mirrorOpacity;
      ctx.beginPath();
      ctx.moveTo(mx1, my1);
      ctx.lineTo(mx2, my2);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}
