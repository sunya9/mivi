import { ColorPickerInput } from "@/components/common/color-picker-input";
import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";

import { AudioVisualizerSectionProps } from "./types";

export function LineSpectrumSettings({ config, setConfig }: AudioVisualizerSectionProps) {
  const m = useMessages();
  return (
    <>
      <Separator />
      <SliderRow
        label={
          <span>
            {m.av_smoothness({ value: Math.round(config.lineSpectrumConfig.tension * 100) })}
          </span>
        }
        value={[config.lineSpectrumConfig.tension]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={([value]) => setConfig({ lineSpectrumConfig: { tension: value } })}
      />
      <Separator />
      <FormRow
        label={<span>{m.av_stroke()}</span>}
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
            label={<span>{m.av_stroke_color()}</span>}
            controller={({ id }) => (
              <ColorPickerInput
                id={id}
                aria-label={m.av_stroke_color()}
                value={config.lineSpectrumConfig.strokeColor}
                onChange={(value) => setConfig({ lineSpectrumConfig: { strokeColor: value } })}
              />
            )}
          />
          <SliderRow
            label={<span>{m.av_line_width({ value: config.lineSpectrumConfig.lineWidth })}</span>}
            value={[config.lineSpectrumConfig.lineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => setConfig({ lineSpectrumConfig: { lineWidth: value } })}
          />
          <SliderRow
            label={
              <span>
                {m.av_stroke_opacity({
                  value: Math.round(config.lineSpectrumConfig.strokeOpacity * 100),
                })}
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
