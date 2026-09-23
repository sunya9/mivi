import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { AudioAnalyzerConfig } from "@/lib/renderers/renderer-config";

import { ConfigFieldsProps } from "./types";

export function AudioAnalyzerFields({ config, onChange }: ConfigFieldsProps<AudioAnalyzerConfig>) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Attack: {config.attackTime}ms</span>}
        value={[config.attackTime]}
        min={0}
        max={300}
        step={10}
        onValueChange={([value]) => onChange({ attackTime: value })}
      />
      <SliderRow
        label={<span>Release: {config.releaseTime}ms</span>}
        value={[config.releaseTime]}
        min={0}
        max={1000}
        step={10}
        onValueChange={([value]) => onChange({ releaseTime: value })}
      />
      <SliderRow
        label={
          <span>
            Frequency Range: {config.minFrequency}Hz - {config.maxFrequency}Hz
          </span>
        }
        value={[config.minFrequency, config.maxFrequency]}
        min={20}
        max={20000}
        step={100}
        onValueChange={([min, max]) => onChange({ minFrequency: min, maxFrequency: max })}
      />
    </>
  );
}
