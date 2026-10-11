import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { LineSpectrumSectionProps } from "./types";

export function LineSpectrumSettings({
  lineSpectrumConfig: config,
  setLineSpectrumConfig: setConfig,
}: LineSpectrumSectionProps) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Smoothness: {Math.round(config.tension * 100)}%</span>}
        value={[config.tension]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={([value]) => setConfig({ tension: value })}
      />
      <Separator />
      <FormRow
        label={<span>Stroke</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.stroke}
            onCheckedChange={(checked) => setConfig({ stroke: checked })}
          />
        )}
      />
      {config.stroke && (
        <>
          <FormRow
            label={<span>Stroke Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label="Stroke Color"
                value={config.strokeColor}
                onChange={(value) => setConfig({ strokeColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>Line Width: {config.lineWidth}px</span>}
            value={[config.lineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setConfig({ lineWidth: value })}
          />
          <SliderRow
            label={<span>Stroke Opacity: {Math.round(config.strokeOpacity * 100)}%</span>}
            value={[config.strokeOpacity]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => setConfig({ strokeOpacity: value })}
          />
        </>
      )}
    </>
  );
}
