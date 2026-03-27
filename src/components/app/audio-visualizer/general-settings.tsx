import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { audioVisualizerPositionOptions } from "@/lib/renderers/renderer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AudioVisualizerSectionProps } from "./types";

export function GeneralSettings({
  config,
  setConfig,
  isCircular,
}: AudioVisualizerSectionProps & { isCircular: boolean }) {
  return (
    <>
      <Separator />
      {!isCircular && (
        <FormRow
          label={<span>Position</span>}
          controller={({ id }) => (
            <Select
              value={config.position}
              onValueChange={(value) => setConfig({ position: value ?? undefined })}
              items={audioVisualizerPositionOptions}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent align="end">
                {audioVisualizerPositionOptions.map((option) => (
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
        label={
          <span>
            {isCircular ? "Size" : "Height"}: {config.height}%
          </span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[config.height]}
            min={10}
            max={80}
            step={5}
            onValueChange={([value]) => setConfig({ height: value })}
          />
        )}
      />
      <FormRow
        label={<span>Mirror</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.mirror}
            onCheckedChange={(checked) => setConfig({ mirror: checked })}
          />
        )}
      />
      {config.mirror && (
        <FormRow
          label={<span>Mirror Opacity: {Math.round(config.mirrorOpacity * 100)}%</span>}
          customControl
          controller={({ labelId, ref }) => (
            <Slider
              ref={ref}
              aria-labelledby={labelId}
              className="w-full max-w-48 min-w-24"
              value={[config.mirrorOpacity]}
              min={0.1}
              max={1}
              step={0.1}
              onValueChange={([value]) => setConfig({ mirrorOpacity: value })}
            />
          )}
        />
      )}
    </>
  );
}
