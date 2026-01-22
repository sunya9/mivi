import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RendererConfig } from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { useCallback } from "react";

interface Props {
  cometConfig: RendererConfig["cometConfig"];
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  minNote?: number;
  maxNote?: number;
}

export function CometConfigPanel({
  cometConfig,
  onUpdateRendererConfig,
  minNote,
  maxNote,
}: Props) {
  const setCometConfig = useCallback(
    (cometConfig: DeepPartial<RendererConfig["cometConfig"]>) =>
      onUpdateRendererConfig({ cometConfig }),
    [onUpdateRendererConfig],
  );
  return (
    <>
      <FormRow
        label={<span>Fall Angle: {cometConfig.fallAngle}°</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.fallAngle]}
            min={0}
            max={360}
            step={5}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ fallAngle: value })}
          />
        )}
      />
      <FormRow
        label={<span>Angle Randomness: ±{cometConfig.angleRandomness}°</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.angleRandomness]}
            min={0}
            max={45}
            step={1}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ angleRandomness: value })
            }
          />
        )}
      />
      <FormRow
        label={<span>Fall Distance: {cometConfig.fallDistancePercent}%</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.fallDistancePercent]}
            min={10}
            max={200}
            step={5}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ fallDistancePercent: value })
            }
          />
        )}
      />
      <FormRow
        label={<span>Fall Duration: {cometConfig.fallDuration}s</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.fallDuration]}
            min={0.01}
            max={5.0}
            step={0.01}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ fallDuration: value })}
          />
        )}
      />
      <FormRow
        label={<span>Fade Out Duration: {cometConfig.fadeOutDuration}s</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.fadeOutDuration]}
            min={0.01}
            max={2.0}
            step={0.01}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ fadeOutDuration: value })
            }
          />
        )}
      />
      <Separator />
      <FormRow
        label={<span>Comet Size: {cometConfig.cometSize}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.cometSize]}
            min={2}
            max={50}
            step={1}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ cometSize: value })}
          />
        )}
      />
      <FormRow
        label={<span>Start Position X: {cometConfig.startPositionX}%</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.startPositionX]}
            min={0}
            max={100}
            step={5}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ startPositionX: value })
            }
          />
        )}
      />
      <FormRow
        label={<span>Start Position Y: {cometConfig.startPositionY}%</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.startPositionY]}
            min={0}
            max={100}
            step={5}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ startPositionY: value })
            }
          />
        )}
      />
      <Separator />
      <FormRow
        label={<span>Trail Length: {cometConfig.trailLength}s</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.trailLength]}
            min={0.01}
            max={3.0}
            step={0.01}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ trailLength: value })}
          />
        )}
      />
      <FormRow
        label={<span>Trail Width: {cometConfig.trailWidth}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.trailWidth]}
            min={1}
            max={10}
            step={1}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ trailWidth: value })}
          />
        )}
      />
      <FormRow
        label={
          <span>
            Trail Opacity: {Math.round(cometConfig.trailOpacity * 100)}%
          </span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.trailOpacity]}
            min={0.1}
            max={1.0}
            step={0.05}
            aria-labelledby={labelId}
            onValueChange={([value]) => setCometConfig({ trailOpacity: value })}
          />
        )}
      />
      <Separator />
      <FormRow
        label={<span>Note Spacing: {cometConfig.spacingMargin}px</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.spacingMargin]}
            min={0}
            max={50}
            step={1}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ spacingMargin: value })
            }
          />
        )}
      />
      <FormRow
        label={
          <span>Spacing Randomness: {cometConfig.spacingRandomness}px</span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.spacingRandomness]}
            min={0}
            max={20}
            step={1}
            aria-labelledby={labelId}
            onValueChange={([value]) =>
              setCometConfig({ spacingRandomness: value })
            }
          />
        )}
      />
      <FormRow
        label={<span>Reverse Stacking</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={cometConfig.reverseStacking}
            onCheckedChange={(checked) =>
              setCometConfig({ reverseStacking: checked })
            }
          />
        )}
      />
      <Separator />
      <FormRow
        label={
          <span className="flex flex-wrap gap-x-2">
            <span>
              View Range: {cometConfig.viewRangeBottom} -{" "}
              {cometConfig.viewRangeTop}
            </span>
            {minNote && maxNote && (
              <span className="text-muted-foreground">
                (Detected range: {minNote} - {maxNote})
              </span>
            )}
          </span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            className="w-full max-w-48 min-w-24"
            value={[cometConfig.viewRangeBottom, cometConfig.viewRangeTop]}
            min={0}
            max={127}
            step={1}
            aria-labelledby={labelId}
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
        )}
      />
    </>
  );
}
