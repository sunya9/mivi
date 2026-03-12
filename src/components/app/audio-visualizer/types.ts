import { AudioVisualizerConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";

export type SetAudioVisualizerConfig = (
  config: DeepPartial<AudioVisualizerConfig>,
) => void;

export interface AudioVisualizerSectionProps {
  config: AudioVisualizerConfig;
  setConfig: SetAudioVisualizerConfig;
}
