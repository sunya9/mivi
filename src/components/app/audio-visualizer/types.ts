import { AudioVisualizerConfig, LineSpectrumConfig } from "@/lib/renderers/renderer-config";

export interface AudioVisualizerSectionProps {
  config: AudioVisualizerConfig;
  setConfig: (config: Partial<AudioVisualizerConfig>) => void;
}

export interface LineSpectrumSectionProps {
  lineSpectrumConfig: LineSpectrumConfig;
  setLineSpectrumConfig: (config: Partial<LineSpectrumConfig>) => void;
}
