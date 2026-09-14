import { getAudioVisualizerPositionOptions } from "@/components/app/renderer-options";
import { FormRow } from "@/components/common/form-row";
import { SelectRow } from "@/components/common/select-row";
import { SliderRow } from "@/components/common/slider-row";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";

import { AudioVisualizerSectionProps } from "./types";

export function GeneralSettings({
  config,
  setConfig,
  isCircular,
}: AudioVisualizerSectionProps & { isCircular: boolean }) {
  const m = useMessages();
  const audioVisualizerPositionOptions = getAudioVisualizerPositionOptions();
  return (
    <>
      <Separator />
      {!isCircular && (
        <SelectRow
          label={<span>{m.common_position()}</span>}
          value={config.position}
          onValueChange={(value) => setConfig({ position: value ?? undefined })}
          items={audioVisualizerPositionOptions}
          placeholder={m.av_position_placeholder()}
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
            {isCircular
              ? m.av_size({ value: config.height })
              : m.av_height({ value: config.height })}
          </span>
        }
        value={[config.height]}
        min={10}
        max={80}
        step={5}
        onValueChange={([value]) => setConfig({ height: value })}
      />
      <FormRow
        label={<span>{m.av_mirror()}</span>}
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
          label={
            <span>{m.av_mirror_opacity({ value: Math.round(config.mirrorOpacity * 100) })}</span>
          }
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
