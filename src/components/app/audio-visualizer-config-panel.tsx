import { useCallback } from "react";

import { getAudioVisualizerStyleOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { useMessages } from "@/lib/locale/use-messages";
import { AudioVisualizerConfig, RendererConfig } from "@/lib/renderers/renderer-config";
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
  const m = useMessages();
  const setConfig = useCallback(
    (config: DeepPartial<AudioVisualizerConfig>) =>
      onUpdateRendererConfig({ audioVisualizerConfig: config }),
    [onUpdateRendererConfig],
  );

  const audioVisualizerStyleOptions = getAudioVisualizerStyleOptions();
  const style = audioVisualizerConfig.style;
  const isEnabled = style !== "none";
  const isCircular = style === "circular";
  const showBarSettings = style === "bars" || style === "lineSpectrum" || isCircular;
  const showLineSpectrumSettings = style === "lineSpectrum";

  return (
    <>
      <SelectRow
        label={<span>{m.common_style()}</span>}
        value={style}
        onValueChange={(value) => setConfig({ style: value ?? undefined })}
        items={audioVisualizerStyleOptions}
        placeholder={m.av_style_placeholder()}
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
