import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { useMessages } from "@/lib/locale/use-messages";

import { AudioVisualizerSectionProps } from "./types";

export function AnalyzerSettings({ config, setConfig }: AudioVisualizerSectionProps) {
  const m = useMessages();
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>{m.av_attack({ value: config.attackTime })}</span>}
        value={[config.attackTime]}
        min={0}
        max={300}
        step={10}
        onValueChange={([value]) => setConfig({ attackTime: value })}
      />
      <SliderRow
        label={<span>{m.av_release({ value: config.releaseTime })}</span>}
        value={[config.releaseTime]}
        min={0}
        max={1000}
        step={10}
        onValueChange={([value]) => setConfig({ releaseTime: value })}
      />
      <SliderRow
        label={
          <span>
            {m.av_frequency_range({ min: config.minFrequency, max: config.maxFrequency })}
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
