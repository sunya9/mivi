import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AudioVisualizerStyle, audioVisualizerBarStyleOptions } from "@/lib/renderers/renderer";

import { AudioVisualizerSectionProps } from "./types";

export function BarSettings({
  config,
  setConfig,
  style,
}: AudioVisualizerSectionProps & { style: AudioVisualizerStyle }) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Bar Count: {config.barCount}</span>}
        value={[config.barCount]}
        min={16}
        max={256}
        step={8}
        onValueChange={([value]) => setConfig({ barCount: value })}
      />
      {style === "bars" && (
        <>
          <SliderRow
            label={<span>Gap: {config.barGap}%</span>}
            value={[config.barGap]}
            min={0}
            max={80}
            step={5}
            onValueChange={([value]) => setConfig({ barGap: value })}
          />
          <SliderRow
            label={<span>Padding: {config.barPadding}%</span>}
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
            label={<span>Bar Style</span>}
            value={config.barStyle}
            onValueChange={(value) => setConfig({ barStyle: value ?? undefined })}
            items={audioVisualizerBarStyleOptions}
            placeholder="Select style"
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
            label={<span>Min Height: {config.barMinHeight}px</span>}
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
