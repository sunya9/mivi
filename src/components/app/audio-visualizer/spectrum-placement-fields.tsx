import { audioVisualizerPositionOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SpectrumPlacementConfig } from "@/lib/renderers/renderer-config";

import { MirrorFields } from "./mirror-fields";
import { ConfigFieldsProps } from "./types";

export function SpectrumPlacementFields({
  config,
  onChange,
}: ConfigFieldsProps<SpectrumPlacementConfig>) {
  return (
    <>
      <Separator />
      <SelectRow
        label={<span>Position</span>}
        value={config.position}
        onValueChange={(value) => {
          if (value == null) return;
          onChange({ position: value });
        }}
        items={audioVisualizerPositionOptions}
        placeholder="Select position"
      >
        <SelectContent align="end">
          {audioVisualizerPositionOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRow>
      <SliderRow
        label={<span>Height: {config.height}%</span>}
        value={[config.height]}
        min={10}
        max={80}
        step={5}
        onValueChange={([value]) => onChange({ height: value })}
      />
      <MirrorFields config={config} onChange={onChange} />
    </>
  );
}
