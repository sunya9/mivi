import { FormRow } from "@/components/common/form-row";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AudioVisualizerSectionProps } from "./types";

export function AnalyzerSettings({
  config,
  setConfig,
}: AudioVisualizerSectionProps) {
  return (
    <>
      <Separator />
      <FormRow
        label={
          <span>
            Frequency Range: {config.minFrequency}Hz - {config.maxFrequency}Hz
          </span>
        }
        customControl
        controller={({ labelId, ref }) => (
          <Slider
            ref={ref}
            aria-labelledby={labelId}
            className="w-full max-w-48 min-w-24"
            value={[config.minFrequency, config.maxFrequency]}
            min={20}
            max={20000}
            step={100}
            onValueChange={([min, max]) =>
              setConfig({ minFrequency: min, maxFrequency: max })
            }
          />
        )}
      />
    </>
  );
}
