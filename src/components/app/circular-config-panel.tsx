import { AudioAnalyzerFields } from "@/components/app/audio-visualizer/audio-analyzer-fields";
import { BarShapeFields } from "@/components/app/audio-visualizer/bar-shape-fields";
import { MirrorFields } from "@/components/app/audio-visualizer/mirror-fields";
import { SpectrumColorFields } from "@/components/app/audio-visualizer/spectrum-color-fields";
import { ConfigFieldsProps } from "@/components/app/audio-visualizer/types";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { CircularConfig } from "@/lib/renderers/renderer-config";

export function CircularConfigPanel({ config, onChange }: ConfigFieldsProps<CircularConfig>) {
  return (
    <>
      <Separator />
      <SliderRow
        label={<span>Size: {config.size}%</span>}
        value={[config.size]}
        min={10}
        max={80}
        step={5}
        onValueChange={([value]) => onChange({ size: value })}
      />
      <MirrorFields config={config} onChange={onChange} />
      <Separator />
      <SliderRow
        label={<span>Bar Count: {config.barCount}</span>}
        value={[config.barCount]}
        min={16}
        max={256}
        step={8}
        onValueChange={([value]) => onChange({ barCount: value })}
      />
      <BarShapeFields config={config} onChange={onChange} />
      <SpectrumColorFields config={config} onChange={onChange} />
      <AudioAnalyzerFields config={config} onChange={onChange} />
    </>
  );
}
