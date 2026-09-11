import { AudioVisualizerConfig } from "@/lib/renderers/renderer-config";
import { DeepPartial } from "@/lib/type-utils";

export interface AudioVisualizerSectionProps {
  config: AudioVisualizerConfig;
  setConfig: (config: DeepPartial<AudioVisualizerConfig>) => void;
}
