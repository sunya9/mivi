import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { MidiTrack } from "@/lib/midi/midi";
import { drawAudioVisualizer } from "@/lib/renderers/audio-visualizer/audio-visualizer";
import { drawBackground } from "@/lib/renderers/background";
import { Renderer, RendererContext } from "@/lib/renderers/renderer";
import { RendererConfig } from "@/lib/renderers/renderer-config";

export interface Frame {
  config: RendererConfig;
  renderer: Renderer;
  tracks: MidiTrack[];
  currentTime: number;
  frequencyData?: FrequencyData | null;
  backgroundImageBitmap?: ImageBitmap;
}

// The one place that knows the layer order shared by the preview and the export
export function drawFrame(ctx: RendererContext, frame: Frame): void {
  const { config, renderer, tracks, currentTime, frequencyData, backgroundImageBitmap } = frame;
  const layer = config.audioVisualizerLayer;

  drawBackground(ctx, config, backgroundImageBitmap);

  if (layer === "back" && frequencyData) {
    drawAudioVisualizer(ctx, frequencyData, config);
  }

  renderer(tracks, currentTime, config);

  if (layer === "front" && frequencyData) {
    drawAudioVisualizer(ctx, frequencyData, config);
  }
}
