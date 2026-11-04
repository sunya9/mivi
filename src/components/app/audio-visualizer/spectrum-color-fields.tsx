import { ReactNode } from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { SpectrumColorConfig } from "@/lib/renderers/renderer-config";

import { ConfigFieldsProps } from "./types";

interface Props extends ConfigFieldsProps<SpectrumColorConfig> {
  gradientDirection?: ReactNode;
}

export function SpectrumColorFields({ config, onChange, gradientDirection }: Props) {
  return (
    <>
      <Separator />
      <FormRow
        label={<span>Use Gradient</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.useGradient}
            onCheckedChange={(checked) => onChange({ useGradient: checked })}
          />
        )}
      />
      {config.useGradient ? (
        <>
          {gradientDirection}
          <FormRow
            label={<span>Gradient Start Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label="Gradient Start Color"
                value={config.gradientStartColor}
                onChange={(value) => onChange({ gradientStartColor: value })}
              />
            )}
          />
          <FormRow
            label={<span>Gradient End Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label="Gradient End Color"
                value={config.gradientEndColor}
                onChange={(value) => onChange({ gradientEndColor: value })}
              />
            )}
          />
        </>
      ) : (
        <FormRow
          label={<span>Color</span>}
          controller={({ id }) => (
            <ColorPickerInput
              id={id}
              aria-label="Color"
              value={config.singleColor}
              onChange={(value) => onChange({ singleColor: value })}
            />
          )}
        />
      )}
      <SliderRow
        label={<span>Opacity: {Math.round(config.opacity * 100)}%</span>}
        value={[config.opacity]}
        min={0.1}
        max={1}
        step={0.05}
        onValueChange={([value]) => onChange({ opacity: value })}
      />
    </>
  );
}
