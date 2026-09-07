import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { AudioVisualizerSectionProps } from "./types";

export function LineSpectrumSettings({ config, setConfig }: AudioVisualizerSectionProps) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Smoothness: {Math.round(config.lineSpectrumConfig.tension * 100)}%</span>}
        value={[config.lineSpectrumConfig.tension]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={([value]) => setConfig({ lineSpectrumConfig: { tension: value } })}
      />
      <Separator />
      <FormRow
        label={<span>Stroke</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.lineSpectrumConfig.stroke}
            onCheckedChange={(checked) => setConfig({ lineSpectrumConfig: { stroke: checked } })}
          />
        )}
      />
      {config.lineSpectrumConfig.stroke && (
        <>
          <FormRow
            label={<span>Stroke Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label="Stroke Color"
                value={config.lineSpectrumConfig.strokeColor}
                onChange={(value) => setConfig({ lineSpectrumConfig: { strokeColor: value } })}
              />
            )}
          />
          <SliderRow
            label={<span>Line Width: {config.lineSpectrumConfig.lineWidth}px</span>}
            value={[config.lineSpectrumConfig.lineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setConfig({ lineSpectrumConfig: { lineWidth: value } })}
          />
          <SliderRow
            label={
              <span>
                Stroke Opacity: {Math.round(config.lineSpectrumConfig.strokeOpacity * 100)}%
              </span>
            }
            value={[config.lineSpectrumConfig.strokeOpacity]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => setConfig({ lineSpectrumConfig: { strokeOpacity: value } })}
          />
        </>
      )}
    </>
  );
}
