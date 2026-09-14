import { getAudioVisualizerBarStyleOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMessages } from "@/lib/locale/use-messages";
import { AudioVisualizerStyle } from "@/lib/renderers/renderer-config";

import { AudioVisualizerSectionProps } from "./types";

export function BarSettings({
  config,
  setConfig,
  style,
}: AudioVisualizerSectionProps & { style: AudioVisualizerStyle }) {
  const m = useMessages();
  const audioVisualizerBarStyleOptions = getAudioVisualizerBarStyleOptions();
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>{m.av_bar_count({ value: config.barCount })}</span>}
        value={[config.barCount]}
        min={16}
        max={256}
        step={8}
        onValueChange={([value]) => setConfig({ barCount: value })}
      />
      {style === "bars" && (
        <>
          <SliderRow
            label={<span>{m.av_bar_gap({ value: config.barGap })}</span>}
            value={[config.barGap]}
            min={0}
            max={80}
            step={5}
            onValueChange={([value]) => setConfig({ barGap: value })}
          />
          <SliderRow
            label={<span>{m.av_bar_padding({ value: config.barPadding })}</span>}
            value={[config.barPadding]}
            min={0}
            max={40}
            step={1}
            onValueChange={([value]) => setConfig({ barPadding: value })}
          />
        </>
      )}
      {(style === "bars" || style === "circular") && (
        <>
          <SelectRow
            label={<span>{m.av_bar_style()}</span>}
            value={config.barStyle}
            onValueChange={(value) => setConfig({ barStyle: value ?? undefined })}
            items={audioVisualizerBarStyleOptions}
            placeholder={m.av_style_placeholder()}
          >
            <SelectContent align="end">
              {audioVisualizerBarStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRow>
          <SliderRow
            label={<span>{m.av_bar_min_height({ value: config.barMinHeight })}</span>}
            value={[config.barMinHeight]}
            min={0}
            max={10}
            step={1}
            onValueChange={([value]) => setConfig({ barMinHeight: value })}
          />
        </>
      )}
    </>
  );
}
