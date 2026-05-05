import { AudioVisualizerConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";

export interface AudioVisualizerSectionProps {
  config: AudioVisualizerConfig;
  setConfig(config: DeepPartial<AudioVisualizerConfig>): void;
}
