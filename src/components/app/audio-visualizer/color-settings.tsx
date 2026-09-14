import { getGradientDirectionOptions } from "@/components/app/renderer-options";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";

import { AudioVisualizerSectionProps } from "./types";

export function ColorSettings({
  config,
  setConfig,
  isCircular,
  showFill,
}: AudioVisualizerSectionProps & {
  isCircular: boolean;
  showFill: boolean;
}) {
  const m = useMessages();
  const gradientDirectionOptions = getGradientDirectionOptions();
  return (
    <>
      <Separator />
      {showFill && (
        <FormRow
          label={<span>{m.common_fill()}</span>}
          controller={({ id }) => (
            <Switch
              id={id}
              checked={config.lineSpectrumConfig.fill}
              onCheckedChange={(checked) => setConfig({ lineSpectrumConfig: { fill: checked } })}
            />
          )}
        />
      )}
      <FormRow
        label={<span>{m.av_use_gradient()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.useGradient}
            onCheckedChange={(checked) => setConfig({ useGradient: checked })}
          />
        )}
      />
      {config.useGradient ? (
        <>
          {!isCircular && (
            <SelectRow
              label={<span>{m.av_gradient_direction()}</span>}
              value={config.gradientDirection}
              onValueChange={(value) => setConfig({ gradientDirection: value ?? undefined })}
              items={gradientDirectionOptions}
              placeholder={m.av_gradient_direction_placeholder()}
            >
              <SelectContent align="end">
                {gradientDirectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRow>
          )}
          <FormRow
            label={<span>{m.av_gradient_start_color()}</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label={m.av_gradient_start_color()}
                value={config.gradientStartColor}
                onChange={(value) => setConfig({ gradientStartColor: value })}
              />
            )}
          />
          <FormRow
            label={<span>{m.av_gradient_end_color()}</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label={m.av_gradient_end_color()}
                value={config.gradientEndColor}
                onChange={(value) => setConfig({ gradientEndColor: value })}
              />
            )}
          />
        </>
      ) : (
        <FormRow
          label={<span>{m.common_color()}</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              aria-label={m.common_color()}
              value={config.singleColor}
              onChange={(value) => setConfig({ singleColor: value })}
            />
          )}
        />
      )}
      {showFill && config.lineSpectrumConfig.fill && (
        <SliderRow
          label={
            <span>
              {m.av_fill_opacity({
                value: Math.round(config.lineSpectrumConfig.fillOpacity * 100),
              })}
            </span>
          }
          value={[config.lineSpectrumConfig.fillOpacity]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) => setConfig({ lineSpectrumConfig: { fillOpacity: value } })}
        />
      )}
      <SliderRow
        label={<span>{m.opacity({ value: Math.round(config.barOpacity * 100) })}</span>}
        value={[config.barOpacity]}
        min={0.1}
        max={1}
        step={0.05}
        onValueChange={([value]) => setConfig({ barOpacity: value })}
      />
    </>
  );
}
