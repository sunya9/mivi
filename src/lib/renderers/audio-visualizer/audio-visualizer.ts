import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { RendererContext } from "@/lib/renderers/renderer";
import { type RendererConfig } from "@/lib/renderers/renderer-config";

import { drawBarSpectrum } from "./bar-spectrum";
import { drawCircular } from "./circular";
import { drawLineSpectrum } from "./line-spectrum";

export function drawAudioVisualizer(
  ctx: RendererContext,
  frequencyData: FrequencyData | null,
  config: RendererConfig,
): void {
  const { audioVisualizerStyle: style, resolution } = config;
  if (style === "none" || !frequencyData) return;

  ctx.save();

  switch (style) {
    case "bars":
      drawBarSpectrum(ctx, frequencyData, config.barsConfig, resolution);
      break;
    case "lineSpectrum":
      drawLineSpectrum(ctx, frequencyData, config.lineSpectrumConfig, resolution);
      break;
    case "circular":
      drawCircular(ctx, frequencyData, config.circularConfig, resolution);
      break;
  }

  ctx.restore();
}
