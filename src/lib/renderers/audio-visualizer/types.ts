import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { AudioVisualizerConfig } from "@/lib/renderers/renderer";

/**
 * Interface for audio visualizer drawer implementations.
 * Each drawer handles a specific visualization style (bars, waveform, etc.).
 */
export interface AudioVisualizerDrawer {
  setConfig(config: AudioVisualizerConfig): void;
  draw(frequencyData: FrequencyData): void;
}
