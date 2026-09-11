import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { RendererContext } from "@/lib/renderers/renderer";
import type { AudioVisualizerConfig } from "@/lib/renderers/renderer-config";
import type { Resolution } from "@/lib/renderers/resolution";

import { calculateBandAmplitudes } from "./band-amplitudes";
import { createSpectrumFillStyle, resolveBaseY } from "./gradient-utils";

type CornerRadii = [number, number, number, number];

// radii: [topLeft, topRight, bottomRight, bottomLeft]
function drawRoundedRect(
  ctx: RendererContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radii);
  ctx.closePath();
  ctx.fill();
}

function drawBar(
  ctx: RendererContext,
  x: number,
  baseY: number,
  width: number,
  height: number,
  style: AudioVisualizerConfig["barStyle"],
  position: AudioVisualizerConfig["position"],
  mirror: boolean,
  mirrorOpacity: number,
  canvasHeight: number,
): void {
  const drawSingleBar = (y: number, h: number, cornerRadius?: CornerRadii) => {
    if (style === "rounded") {
      const radius = Math.min(width / 2, Math.abs(h) / 2, 4);
      const radii = cornerRadius ?? [radius, radius, radius, radius];
      drawRoundedRect(ctx, x, y, width, h, radii);
    } else {
      ctx.fillRect(x, y, width, h);
    }
  };

  const radius = Math.min(width / 2, height / 2, 4);

  switch (position) {
    case "bottom":
      // Rounded top, flat bottom
      drawSingleBar(baseY - height, height, [radius, radius, 0, 0]);
      if (mirror) {
        // Mirror sticks to top of canvas, pointing down
        ctx.save();
        ctx.globalAlpha *= mirrorOpacity;
        drawSingleBar(0, height, [0, 0, radius, radius]);
        ctx.restore();
      }
      break;
    case "top":
      // Flat top, rounded bottom
      drawSingleBar(baseY, height, [0, 0, radius, radius]);
      if (mirror) {
        // Mirror sticks to bottom of canvas, pointing up
        ctx.save();
        ctx.globalAlpha *= mirrorOpacity;
        drawSingleBar(canvasHeight - height, height, [radius, radius, 0, 0]);
        ctx.restore();
      }
      break;
    case "center": {
      // Main bar: rounded top, flat bottom (touching center)
      drawSingleBar(baseY - height, height, [radius, radius, 0, 0]);
      if (mirror) {
        // Mirror: flat top (touching center), rounded bottom
        ctx.save();
        ctx.globalAlpha *= mirrorOpacity;
        drawSingleBar(baseY, height, [0, 0, radius, radius]);
        ctx.restore();
      }
      break;
    }
  }
}

export function drawBarSpectrum(
  ctx: RendererContext,
  frequencyData: FrequencyData,
  config: AudioVisualizerConfig,
  resolution: Resolution,
): void {
  const canvasWidth = resolution.width;
  const canvasHeight = resolution.height;

  const {
    barCount,
    barGap,
    barPadding,
    barMinHeight,
    barStyle,
    barOpacity,
    position,
    height: heightPercent,
    mirror,
    mirrorOpacity,
    minFrequency,
    maxFrequency,
  } = config;

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

  const baseY = resolveBaseY(position, canvasHeight);

  ctx.save();
  ctx.globalAlpha = barOpacity;
  ctx.fillStyle = createSpectrumFillStyle(ctx, config, canvasWidth, canvasHeight);

  const binsPerBar = calculateBandAmplitudes(frequencyData, barCount, minFrequency, maxFrequency);

  // Draw bars
  for (let i = 0; i < barCount; i++) {
    const amplitude = binsPerBar[i];
    // Normalize amplitude (0-255) to height
    const barHeight = Math.max(barMinHeight, (amplitude / 255) * visualizerHeight);

    const x = startX + i * (barWidth + gapWidth);

    drawBar(
      ctx,
      x,
      baseY,
      barWidth,
      barHeight,
      barStyle,
      position,
      mirror,
      mirrorOpacity,
      canvasHeight,
    );
  }

  ctx.restore();
}
