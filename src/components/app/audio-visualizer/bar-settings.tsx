import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AudioVisualizerStyle, audioVisualizerBarStyleOptions } from "@/lib/renderers/renderer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AudioVisualizerSectionProps } from "./types";

export function BarSettings({
  config,
  setConfig,
  style,
}: AudioVisualizerSectionProps & { style: AudioVisualizerStyle }) {
  return (
    <>
      <Separator />
      <FormRow
        label={<span>Bar Count: {config.barCount}</span>}
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[config.barCount]}
            min={16}
            max={256}
            step={8}
            onValueChange={([value]) => setConfig({ barCount: value })}
          />
        )}
      />
      {style === "bars" && (
        <>
          <FormRow
            label={<span>Gap: {config.barGap}%</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[config.barGap]}
                min={0}
                max={80}
                step={5}
                onValueChange={([value]) => setConfig({ barGap: value })}
              />
            )}
          />
          <FormRow
            label={<span>Padding: {config.barPadding}%</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[config.barPadding]}
                min={0}
                max={40}
                step={1}
                onValueChange={([value]) => setConfig({ barPadding: value })}
              />
            )}
          />
        </>
      )}
      {(style === "bars" || style === "circular") && (
        <>
          <FormRow
            label={<span>Bar Style</span>}
            controller={({ id }) => (
              <Select
                value={config.barStyle}
                onValueChange={(value) => setConfig({ barStyle: value ?? undefined })}
                items={audioVisualizerBarStyleOptions}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent align="end">
                  {audioVisualizerBarStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormRow
            label={<span>Min Height: {config.barMinHeight}px</span>}
            customControl
            controller={({ labelId, ref }) => (
              <Slider
                ref={ref}
                aria-labelledby={labelId}
                className="w-full max-w-48 min-w-24"
                value={[config.barMinHeight]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) => setConfig({ barMinHeight: value })}
              />
            )}
          />
        </>
      )}
    </>
  );
}
