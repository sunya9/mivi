import { useCallback } from "react";

import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMessages } from "@/lib/locale/use-messages";
import { RendererConfig, CometConfig } from "@/lib/renderers/renderer-config";
import { DeepPartial } from "@/lib/type-utils";

interface Props {
  cometConfig: CometConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function CometConfigPanel({ cometConfig, onUpdateRendererConfig, minNote, maxNote }: Props) {
  const m = useMessages();
  const setCometConfig = useCallback(
    (cometConfig: DeepPartial<CometConfig>) => onUpdateRendererConfig({ cometConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <SliderRow
        label={<span>{m.comet_fall_angle({ value: cometConfig.fallAngle })}</span>}
        value={[cometConfig.fallAngle]}
        min={0}
        max={360}
        step={5}
        onValueChange={([value]) => setCometConfig({ fallAngle: value })}
      />
      <SliderRow
        label={<span>{m.comet_angle_randomness({ value: cometConfig.angleRandomness })}</span>}
        value={[cometConfig.angleRandomness]}
        min={0}
        max={45}
        step={1}
        onValueChange={([value]) => setCometConfig({ angleRandomness: value })}
      />
      <SliderRow
        label={<span>{m.comet_fall_distance({ value: cometConfig.fallDistancePercent })}</span>}
        value={[cometConfig.fallDistancePercent]}
        min={10}
        max={200}
        step={5}
        onValueChange={([value]) => setCometConfig({ fallDistancePercent: value })}
      />
      <SliderRow
        label={<span>{m.comet_fall_duration({ value: cometConfig.fallDuration })}</span>}
        value={[cometConfig.fallDuration]}
        min={0.01}
        max={5.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ fallDuration: value })}
      />
      <SliderRow
        label={<span>{m.comet_fade_out_duration({ value: cometConfig.fadeOutDuration })}</span>}
        value={[cometConfig.fadeOutDuration]}
        min={0.01}
        max={2.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ fadeOutDuration: value })}
      />
      <Separator />
      <SliderRow
        label={<span>{m.comet_size({ value: cometConfig.cometSize })}</span>}
        value={[cometConfig.cometSize]}
        min={2}
        max={50}
        step={1}
        onValueChange={([value]) => setCometConfig({ cometSize: value })}
      />
      <SliderRow
        label={<span>{m.comet_start_position_x({ value: cometConfig.startPositionX })}</span>}
        value={[cometConfig.startPositionX]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => setCometConfig({ startPositionX: value })}
      />
      <SliderRow
        label={<span>{m.comet_start_position_y({ value: cometConfig.startPositionY })}</span>}
        value={[cometConfig.startPositionY]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => setCometConfig({ startPositionY: value })}
      />
      <Separator />
      <SliderRow
        label={<span>{m.comet_trail_length({ value: cometConfig.trailLength })}</span>}
        value={[cometConfig.trailLength]}
        min={0.01}
        max={3.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ trailLength: value })}
      />
      <SliderRow
        label={<span>{m.comet_trail_width({ value: cometConfig.trailWidth })}</span>}
        value={[cometConfig.trailWidth]}
        min={1}
        max={10}
        step={1}
        onValueChange={([value]) => setCometConfig({ trailWidth: value })}
      />
      <SliderRow
        label={
          <span>
            {m.comet_trail_opacity({ value: Math.round(cometConfig.trailOpacity * 100) })}
          </span>
        }
        value={[cometConfig.trailOpacity]}
        min={0.1}
        max={1.0}
        step={0.05}
        onValueChange={([value]) => setCometConfig({ trailOpacity: value })}
      />
      <Separator />
      <SliderRow
        label={<span>{m.comet_note_spacing({ value: cometConfig.spacingMargin })}</span>}
        value={[cometConfig.spacingMargin]}
        min={0}
        max={50}
        step={1}
        onValueChange={([value]) => setCometConfig({ spacingMargin: value })}
      />
      <SliderRow
        label={<span>{m.comet_spacing_randomness({ value: cometConfig.spacingRandomness })}</span>}
        value={[cometConfig.spacingRandomness]}
        min={0}
        max={20}
        step={1}
        onValueChange={([value]) => setCometConfig({ spacingRandomness: value })}
      />
      <FormRow
        label={<span>{m.comet_reverse_stacking()}</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={cometConfig.reverseStacking}
            onCheckedChange={(checked) => setCometConfig({ reverseStacking: checked })}
          />
        )}
      />
      <Separator />
      <SliderRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              {m.view_range({ bottom: cometConfig.viewRangeBottom, top: cometConfig.viewRangeTop })}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                {m.detected_range({ min: minNote, max: maxNote })}
              </span>
            )}
          </span>
        }
        value={[cometConfig.viewRangeBottom, cometConfig.viewRangeTop]}
        min={0}
        max={127}
        step={1}
        defaultValue={[
          Math.min(0, minNote ? minNote - 10 : 0),
          Math.max(127, maxNote ? maxNote + 10 : 127),
        ]}
        onValueChange={([bottom, top]) =>
          setCometConfig({
            viewRangeBottom: bottom,
            viewRangeTop: top,
          })
        }
      />
    </>
  );
}
