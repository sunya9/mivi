import { audioVisualizerStyleOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { AudioVisualizerConfig, LineSpectrumConfig } from "@/lib/renderers/renderer-config";

import { AnalyzerSettings } from "./audio-visualizer/analyzer-settings";
import { BarSettings } from "./audio-visualizer/bar-settings";
import { ColorSettings } from "./audio-visualizer/color-settings";
import { GeneralSettings } from "./audio-visualizer/general-settings";
import { LineSpectrumSettings } from "./audio-visualizer/line-spectrum-settings";

interface Props {
  config: AudioVisualizerConfig;
  onChange: (partial: Partial<AudioVisualizerConfig>) => void;
}

export function AudioVisualizerConfigPanel({ config, onChange }: Props) {
  const setLineSpectrumConfig = (partial: Partial<LineSpectrumConfig>) =>
    onChange({ lineSpectrumConfig: { ...config.lineSpectrumConfig, ...partial } });

  const style = config.style;
  const isEnabled = style !== "none";
  const isCircular = style === "circular";
  const showBarSettings = style === "bars" || style === "lineSpectrum" || isCircular;
  const showLineSpectrumSettings = style === "lineSpectrum";

  return (
    <>
      <SelectRow
        label={<span>Style</span>}
        value={style}
        onValueChange={(value) => {
          if (value == null) return;
          onChange({ style: value });
        }}
        items={audioVisualizerStyleOptions}
        placeholder="Select style"
      >
        <SelectContent align="end">
          {audioVisualizerStyleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRow>
      {isEnabled && (
        <>
          <GeneralSettings config={config} setConfig={onChange} isCircular={isCircular} />
          {showBarSettings && <BarSettings config={config} setConfig={onChange} style={style} />}
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
      )}
    </>
  );
}
