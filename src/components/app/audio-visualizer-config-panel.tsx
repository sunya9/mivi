import { FormRow } from "@/components/common/form-row";
import {
  AudioVisualizerConfig,
  RendererConfig,
  audioVisualizerStyleOptions,
} from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { useCallback } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GeneralSettings } from "./audio-visualizer/general-settings";
import { BarSettings } from "./audio-visualizer/bar-settings";
import { LineSpectrumSettings } from "./audio-visualizer/line-spectrum-settings";
import { ColorSettings } from "./audio-visualizer/color-settings";
import { AnalyzerSettings } from "./audio-visualizer/analyzer-settings";

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
      <FormRow
        label={<span>Style</span>}
        controller={({ id }) => (
          <Select
            value={style}
            onValueChange={(value) => setConfig({ style: value ?? undefined })}
            items={audioVisualizerStyleOptions}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent align="end">
              {audioVisualizerStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
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
