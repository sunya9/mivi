import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { audioVisualizerPositionOptions } from "@/lib/renderers/renderer";

import { AudioVisualizerSectionProps } from "./types";

export function GeneralSettings({
  config,
  setConfig,
  isCircular,
}: AudioVisualizerSectionProps & { isCircular: boolean }) {
  return (
    <>
      <Separator />
      {!isCircular && (
        <SelectRow
          label={<span>Position</span>}
          value={config.position}
          onValueChange={(value) => setConfig({ position: value ?? undefined })}
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
      )}
      <SliderRow
        label={
          <span>
            {isCircular ? "Size" : "Height"}: {config.height}%
          </span>
        }
        value={[config.height]}
        min={10}
        max={80}
        step={5}
        onValueChange={([value]) => setConfig({ height: value })}
      />
      <FormRow
        label={<span>Mirror</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.mirror}
            onCheckedChange={(checked) => setConfig({ mirror: checked })}
          />
        )}
      />
      {config.mirror && (
        <SliderRow
          label={<span>Mirror Opacity: {Math.round(config.mirrorOpacity * 100)}%</span>}
          value={[config.mirrorOpacity]}
          min={0.1}
          max={1}
          step={0.1}
          onValueChange={([value]) => setConfig({ mirrorOpacity: value })}
        />
      )}
    </>
  );
}
