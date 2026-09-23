import {
  AudioVisualizerConfig,
  AudioVisualizerStyle,
  LineSpectrumConfig,
} from "@/lib/renderers/renderer-config";

import { AnalyzerSettings } from "./audio-visualizer/analyzer-settings";
import { BarSettings } from "./audio-visualizer/bar-settings";
import { ColorSettings } from "./audio-visualizer/color-settings";
import { GeneralSettings } from "./audio-visualizer/general-settings";
import { LineSpectrumSettings } from "./audio-visualizer/line-spectrum-settings";

interface Props {
  style: Exclude<AudioVisualizerStyle, "none">;
  config: AudioVisualizerConfig;
  onChange: (partial: Partial<AudioVisualizerConfig>) => void;
}

export function AudioVisualizerConfigPanel({ style, config, onChange }: Props) {
  const setLineSpectrumConfig = (partial: Partial<LineSpectrumConfig>) =>
    onChange({ lineSpectrumConfig: { ...config.lineSpectrumConfig, ...partial } });

  const isCircular = style === "circular";
  const showLineSpectrumSettings = style === "lineSpectrum";

  return (
    <>
      <GeneralSettings config={config} setConfig={onChange} isCircular={isCircular} />
      <BarSettings config={config} setConfig={onChange} style={style} />
      {showLineSpectrumSettings && (
        <LineSpectrumSettings
          lineSpectrumConfig={config.lineSpectrumConfig}
          setLineSpectrumConfig={setLineSpectrumConfig}
        />
      )}
      <ColorSettings
        config={config}
        setConfig={onChange}
        lineSpectrumConfig={config.lineSpectrumConfig}
        setLineSpectrumConfig={setLineSpectrumConfig}
        isCircular={isCircular}
        showFill={showLineSpectrumSettings}
      />
      <AnalyzerSettings config={config} setConfig={onChange} />
    </>
  );
}
