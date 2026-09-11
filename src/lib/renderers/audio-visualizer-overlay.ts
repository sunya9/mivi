import type { FrequencyData } from "@/lib/audio/audio-analyzer";

import { drawBarSpectrum } from "./audio-visualizer/bar-spectrum-drawer";
import { drawCircular } from "./audio-visualizer/circular-drawer";
import { drawLineSpectrum } from "./audio-visualizer/line-spectrum-drawer";
import type { AudioVisualizerConfig, RendererContext, Resolution } from "./renderer";

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
