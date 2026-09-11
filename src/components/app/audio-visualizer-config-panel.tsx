import { useCallback } from "react";

import { SelectRow } from "@/components/common/select-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  AudioVisualizerConfig,
  RendererConfig,
  audioVisualizerStyleOptions,
} from "@/lib/renderers/renderer-config";
import { DeepPartial } from "@/lib/type-utils";

import { AnalyzerSettings } from "./audio-visualizer/analyzer-settings";
import { BarSettings } from "./audio-visualizer/bar-settings";
import { ColorSettings } from "./audio-visualizer/color-settings";
import { GeneralSettings } from "./audio-visualizer/general-settings";
import { LineSpectrumSettings } from "./audio-visualizer/line-spectrum-settings";

interface Props {
  audioVisualizerConfig: AudioVisualizerConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
}

export function AudioVisualizerConfigPanel({
  audioVisualizerConfig,
  onUpdateRendererConfig,
}: Props) {
  const setConfig = useCallback(
    (config: DeepPartial<AudioVisualizerConfig>) =>
      onUpdateRendererConfig({ audioVisualizerConfig: config }),
    [onUpdateRendererConfig],
  );

  const style = audioVisualizerConfig.style;
  const isEnabled = style !== "none";
  const isCircular = style === "circular";
  const showBarSettings = style === "bars" || style === "lineSpectrum" || isCircular;
  const showLineSpectrumSettings = style === "lineSpectrum";

  return (
    <>
      <SelectRow
        label={<span>Style</span>}
        value={style}
        onValueChange={(value) => setConfig({ style: value ?? undefined })}
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
          <GeneralSettings
            config={audioVisualizerConfig}
            setConfig={setConfig}
            isCircular={isCircular}
          />
          {showBarSettings && (
            <BarSettings config={audioVisualizerConfig} setConfig={setConfig} style={style} />
          )}
          {showLineSpectrumSettings && (
            <LineSpectrumSettings config={audioVisualizerConfig} setConfig={setConfig} />
          )}
          <ColorSettings
            config={audioVisualizerConfig}
            setConfig={setConfig}
            isCircular={isCircular}
            showFill={showLineSpectrumSettings}
          />
          <AnalyzerSettings config={audioVisualizerConfig} setConfig={setConfig} />
        </>
      )}
    </>
  );
}
