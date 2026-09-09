import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";

import { AudioVisualizerSectionProps } from "./types";

export function AnalyzerSettings({ config, setConfig }: AudioVisualizerSectionProps) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Attack: {config.attackTime}ms</span>}
        value={[config.attackTime]}
        min={0}
        max={300}
        step={10}
        onValueChange={([value]) => setConfig({ attackTime: value })}
      />
      <SliderRow
        label={<span>Release: {config.releaseTime}ms</span>}
        value={[config.releaseTime]}
        min={0}
        max={1000}
        step={10}
        onValueChange={([value]) => setConfig({ releaseTime: value })}
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
        onValueChange={([min, max]) => setConfig({ minFrequency: min, maxFrequency: max })}
      />
    </>
  );
}
