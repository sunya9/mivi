import { audioVisualizerBarStyleOptions } from "@/components/app/renderer-options";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { BarsConfig } from "@/lib/renderers/renderer-config";

import { ConfigFieldsProps } from "./types";

type BarShapeConfig = Pick<BarsConfig, "barStyle" | "barMinHeight">;

export function BarShapeFields({ config, onChange }: ConfigFieldsProps<BarShapeConfig>) {
  return (
    <>
      <SelectRow
        label={<span>Bar Style</span>}
        value={config.barStyle}
        onValueChange={(value) => {
          if (value == null) return;
          onChange({ barStyle: value });
        }}
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
        onValueChange={([value]) => onChange({ barMinHeight: value })}
      />
    </>
  );
}
