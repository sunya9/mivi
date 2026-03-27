import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { gradientDirectionOptions } from "@/lib/renderers/renderer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  return (
    <>
      <Separator />
      {showFill && (
        <FormRow
          label={<span>Fill</span>}
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
        label={<span>Use Gradient</span>}
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
            <FormRow
              label={<span>Gradient Direction</span>}
              controller={({ id }) => (
                <Select
                  value={config.gradientDirection}
                  onValueChange={(value) => setConfig({ gradientDirection: value ?? undefined })}
                  items={gradientDirectionOptions}
                >
                  <SelectTrigger id={id}>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {gradientDirectionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          <FormRow
            label={<span>Gradient Start Color</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label="Gradient Start Color"
                value={config.gradientStartColor}
                onChange={(value) => setConfig({ gradientStartColor: value })}
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
                onChange={(value) => setConfig({ gradientEndColor: value })}
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
              onChange={(value) => setConfig({ singleColor: value })}
            />
          )}
        />
      )}
      {showFill && config.lineSpectrumConfig.fill && (
        <FormRow
          label={
            <span>Fill Opacity: {Math.round(config.lineSpectrumConfig.fillOpacity * 100)}%</span>
          }
          customControl
          controller={({ labelId, ref }) => (
            <Slider
              ref={ref}
              aria-labelledby={labelId}
              className="w-full max-w-48 min-w-24"
              value={[config.lineSpectrumConfig.fillOpacity]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => setConfig({ lineSpectrumConfig: { fillOpacity: value } })}
            />
          )}
        />
      )}
      <FormRow
        label={<span>Opacity: {Math.round(config.barOpacity * 100)}%</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[config.barOpacity]}
            min={0.1}
            max={1}
            step={0.05}
            onValueChange={([value]) => setConfig({ barOpacity: value })}
          />
        )}
      />
    </>
  );
}
