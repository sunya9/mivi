import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CometConfig } from "@/lib/renderers/renderer-config";

interface Props {
  config: CometConfig;
  onChange: (partial: Partial<CometConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function CometConfigPanel({ config, onChange, minNote, maxNote }: Props) {
  return (
    <>
      <SliderRow
        label={<span>Fall Angle: {config.fallAngle}°</span>}
        value={[config.fallAngle]}
        min={0}
        max={360}
        step={5}
        onValueChange={([value]) => onChange({ fallAngle: value })}
      />
      <SliderRow
        label={<span>Angle Randomness: ±{config.angleRandomness}°</span>}
        value={[config.angleRandomness]}
        min={0}
        max={45}
        step={1}
        onValueChange={([value]) => onChange({ angleRandomness: value })}
      />
      <SliderRow
        label={<span>Fall Distance: {config.fallDistancePercent}%</span>}
        value={[config.fallDistancePercent]}
        min={10}
        max={200}
        step={5}
        onValueChange={([value]) => onChange({ fallDistancePercent: value })}
      />
      <SliderRow
        label={<span>Fall Duration: {config.fallDuration}s</span>}
        value={[config.fallDuration]}
        min={0.01}
        max={5.0}
        step={0.01}
        onValueChange={([value]) => onChange({ fallDuration: value })}
      />
      <SliderRow
        label={<span>Fade Out Duration: {config.fadeOutDuration}s</span>}
        value={[config.fadeOutDuration]}
        min={0.01}
        max={2.0}
        step={0.01}
        onValueChange={([value]) => onChange({ fadeOutDuration: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Comet Size: {config.cometSize}px</span>}
        value={[config.cometSize]}
        min={2}
        max={50}
        step={1}
        onValueChange={([value]) => onChange({ cometSize: value })}
      />
      <SliderRow
        label={<span>Start Position X: {config.startPositionX}%</span>}
        value={[config.startPositionX]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => onChange({ startPositionX: value })}
      />
      <SliderRow
        label={<span>Start Position Y: {config.startPositionY}%</span>}
        value={[config.startPositionY]}
        min={0}
        max={100}
        step={5}
        onValueChange={([value]) => onChange({ startPositionY: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Trail Length: {config.trailLength}s</span>}
        value={[config.trailLength]}
        min={0.01}
        max={3.0}
        step={0.01}
        onValueChange={([value]) => onChange({ trailLength: value })}
      />
      <SliderRow
        label={<span>Trail Width: {config.trailWidth}px</span>}
        value={[config.trailWidth]}
        min={1}
        max={10}
        step={1}
        onValueChange={([value]) => onChange({ trailWidth: value })}
      />
      <SliderRow
        label={<span>Trail Opacity: {Math.round(config.trailOpacity * 100)}%</span>}
        value={[config.trailOpacity]}
        min={0.1}
        max={1.0}
        step={0.05}
        onValueChange={([value]) => onChange({ trailOpacity: value })}
      />
      <Separator />
      <SliderRow
        label={<span>Note Spacing: {config.spacingMargin}px</span>}
        value={[config.spacingMargin]}
        min={0}
        max={50}
        step={1}
        onValueChange={([value]) => onChange({ spacingMargin: value })}
      />
      <SliderRow
        label={<span>Spacing Randomness: {config.spacingRandomness}px</span>}
        value={[config.spacingRandomness]}
        min={0}
        max={20}
        step={1}
        onValueChange={([value]) => onChange({ spacingRandomness: value })}
      />
      <FormRow
        label={<span>Reverse Stacking</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.reverseStacking}
            onCheckedChange={(checked) => onChange({ reverseStacking: checked })}
          />
        )}
      />
      <Separator />
      <SliderRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {config.viewRangeBottom} - {config.viewRangeTop}
            </span>
            {minNote !== undefined && maxNote !== undefined && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        value={[config.viewRangeBottom, config.viewRangeTop]}
        min={0}
        max={127}
        step={1}
        defaultValue={[
          Math.min(0, minNote ? minNote - 10 : 0),
          Math.max(127, maxNote ? maxNote + 10 : 127),
        ]}
        onValueChange={([bottom, top]) =>
          onChange({
            viewRangeBottom: bottom,
            viewRangeTop: top,
          })
        }
      />
    </>
  );
}
