import { AudioAnalyzerFields } from "@/components/app/audio-visualizer/audio-analyzer-fields";
import { GradientDirectionField } from "@/components/app/audio-visualizer/gradient-direction-field";
import { SpectrumColorFields } from "@/components/app/audio-visualizer/spectrum-color-fields";
import { SpectrumPlacementFields } from "@/components/app/audio-visualizer/spectrum-placement-fields";
import { ConfigFieldsProps } from "@/components/app/audio-visualizer/types";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LineSpectrumConfig } from "@/lib/renderers/renderer-config";

export function LineSpectrumConfigPanel({
  config,
  onChange,
}: ConfigFieldsProps<LineSpectrumConfig>) {
  return (
    <>
      <SpectrumPlacementFields config={config} onChange={onChange} />
      <Separator />
      <SliderRow
        label={<span>Bar Count: {config.barCount}</span>}
        value={[config.barCount]}
        min={16}
        max={256}
        step={8}
        onValueChange={([value]) => onChange({ barCount: value })}
      />
      <SliderRow
        label={<span>Smoothness: {Math.round(config.tension * 100)}%</span>}
        value={[config.tension]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={([value]) => onChange({ tension: value })}
      />
      <Separator />
      <FormRow
        label={<span>Stroke</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.stroke}
            onCheckedChange={(checked) => onChange({ stroke: checked })}
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
                onChange={(value) => onChange({ strokeColor: value })}
              />
            )}
          />
          <SliderRow
            label={<span>Line Width: {config.lineWidth}px</span>}
            value={[config.lineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => onChange({ lineWidth: value })}
          />
          <SliderRow
            label={<span>Stroke Opacity: {Math.round(config.strokeOpacity * 100)}%</span>}
            value={[config.strokeOpacity]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => onChange({ strokeOpacity: value })}
          />
        </>
      )}
      <Separator />
      <FormRow
        label={<span>Fill</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.fill}
            onCheckedChange={(checked) => onChange({ fill: checked })}
          />
        )}
      />
      {config.fill && (
        <SliderRow
          label={<span>Fill Opacity: {Math.round(config.fillOpacity * 100)}%</span>}
          value={[config.fillOpacity]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) => onChange({ fillOpacity: value })}
        />
      )}
      <SpectrumColorFields
        config={config}
        onChange={onChange}
        gradientDirection={<GradientDirectionField config={config} onChange={onChange} />}
      />
      <AudioAnalyzerFields config={config} onChange={onChange} />
    </>
  );
}
