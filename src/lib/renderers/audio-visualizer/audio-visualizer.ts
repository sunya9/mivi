import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { RendererContext } from "@/lib/renderers/renderer";
import type { AudioVisualizerConfig } from "@/lib/renderers/renderer-config";
import type { Resolution } from "@/lib/renderers/resolution";

import { drawBarSpectrum } from "./bar-spectrum";
import { drawCircular } from "./circular";
import { drawLineSpectrum } from "./line-spectrum";

export function drawAudioVisualizer(
  ctx: RendererContext,
  frequencyData: FrequencyData | null,
  config: AudioVisualizerConfig,
  resolution: Resolution,
): void {
  if (config.style === "none" || !frequencyData) return;

  ctx.save();

  switch (config.style) {
    case "bars":
      drawBarSpectrum(ctx, frequencyData, config, resolution);
      break;
    case "lineSpectrum":
      drawLineSpectrum(ctx, frequencyData, config, resolution);
      break;
    case "circular":
      drawCircular(ctx, frequencyData, config, resolution);
      break;
  }

  ctx.restore();
}
