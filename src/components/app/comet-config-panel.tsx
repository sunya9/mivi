import { useCallback } from "react";

import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RendererConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";

interface Props {
  cometConfig: RendererConfig["cometConfig"];
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function CometConfigPanel({ cometConfig, onUpdateRendererConfig, minNote, maxNote }: Props) {
  const setCometConfig = useCallback(
    (cometConfig: DeepPartial<RendererConfig["cometConfig"]>) =>
      onUpdateRendererConfig({ cometConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <SliderRow
        label={<span>Fall Angle: {cometConfig.fallAngle}°</span>}
        value={[cometConfig.fallAngle]}
        min={0}
        max={360}
        step={5}
        onValueChange={([value]) => setCometConfig({ fallAngle: value })}
      />
      <SliderRow
        label={<span>Angle Randomness: ±{cometConfig.angleRandomness}°</span>}
        value={[cometConfig.angleRandomness]}
        min={0}
        max={45}
        step={1}
        onValueChange={([value]) => setCometConfig({ angleRandomness: value })}
      />
      <SliderRow
        label={<span>Fall Distance: {cometConfig.fallDistancePercent}%</span>}
        value={[cometConfig.fallDistancePercent]}
        min={10}
        max={200}
        step={5}
        onValueChange={([value]) => setCometConfig({ fallDistancePercent: value })}
      />
      <SliderRow
        label={<span>Fall Duration: {cometConfig.fallDuration}s</span>}
        value={[cometConfig.fallDuration]}
        min={0.01}
        max={5.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ fallDuration: value })}
      />
      <SliderRow
        label={<span>Fade Out Duration: {cometConfig.fadeOutDuration}s</span>}
        value={[cometConfig.fadeOutDuration]}
        min={0.01}
        max={2.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ fadeOutDuration: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Comet Size: {cometConfig.cometSize}px</span>}
        value={[cometConfig.cometSize]}
        min={2}
        max={50}
        step={1}
        onValueChange={([value]) => setCometConfig({ cometSize: value })}
      />
      <SliderRow
        label={<span>Start Position X: {cometConfig.startPositionX}%</span>}
        value={[cometConfig.startPositionX]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => setCometConfig({ startPositionX: value })}
      />
      <SliderRow
        label={<span>Start Position Y: {cometConfig.startPositionY}%</span>}
        value={[cometConfig.startPositionY]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => setCometConfig({ startPositionY: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Trail Length: {cometConfig.trailLength}s</span>}
        value={[cometConfig.trailLength]}
        min={0.01}
        max={3.0}
        step={0.01}
        onValueChange={([value]) => setCometConfig({ trailLength: value })}
      />
      <SliderRow
        label={<span>Trail Width: {cometConfig.trailWidth}px</span>}
        value={[cometConfig.trailWidth]}
        min={1}
        max={10}
        step={1}
        onValueChange={([value]) => setCometConfig({ trailWidth: value })}
      />
      <SliderRow
        label={<span>Trail Opacity: {Math.round(cometConfig.trailOpacity * 100)}%</span>}
        value={[cometConfig.trailOpacity]}
        min={0.1}
        max={1.0}
        step={0.05}
        onValueChange={([value]) => setCometConfig({ trailOpacity: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Note Spacing: {cometConfig.spacingMargin}px</span>}
        value={[cometConfig.spacingMargin]}
        min={0}
        max={50}
        step={1}
        onValueChange={([value]) => setCometConfig({ spacingMargin: value })}
      />
      <SliderRow
        label={<span>Spacing Randomness: {cometConfig.spacingRandomness}px</span>}
        value={[cometConfig.spacingRandomness]}
        min={0}
        max={20}
        step={1}
        onValueChange={([value]) => setCometConfig({ spacingRandomness: value })}
      />
      <FormRow
        label={<span>Reverse Stacking</span>}
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
              View Range: {cometConfig.viewRangeBottom} - {cometConfig.viewRangeTop}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
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
