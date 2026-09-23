import { AudioAnalyzerFields } from "@/components/app/audio-visualizer/audio-analyzer-fields";
import { BarShapeFields } from "@/components/app/audio-visualizer/bar-shape-fields";
import { GradientDirectionField } from "@/components/app/audio-visualizer/gradient-direction-field";
import { SpectrumColorFields } from "@/components/app/audio-visualizer/spectrum-color-fields";
import { SpectrumPlacementFields } from "@/components/app/audio-visualizer/spectrum-placement-fields";
import { ConfigFieldsProps } from "@/components/app/audio-visualizer/types";
import { SliderRow } from "@/components/common/slider-row";
import { Separator } from "@/components/ui/separator";
import { BarsConfig } from "@/lib/renderers/renderer-config";

export function BarsConfigPanel({ config, onChange }: ConfigFieldsProps<BarsConfig>) {
  return (
    <>
      <SpectrumPlacementFields config={config} onChange={onChange} />
      <Separator />
      <SliderRow
        label={<span>Bar Count: {config.barCount}</span>}
        value={[config.barCount]}
        min={16}
        max={256}
        step={8}
        onValueChange={([value]) => onChange({ barCount: value })}
      />
      <SliderRow
        label={<span>Gap: {config.barGap}%</span>}
        value={[config.barGap]}
        min={0}
        max={80}
        step={5}
        onValueChange={([value]) => onChange({ barGap: value })}
      />
      <SliderRow
        label={<span>Padding: {config.barPadding}%</span>}
        value={[config.barPadding]}
        min={0}
        max={40}
        step={1}
        onValueChange={([value]) => onChange({ barPadding: value })}
      />
      <BarShapeFields config={config} onChange={onChange} />
      <SpectrumColorFields
        config={config}
        onChange={onChange}
        gradientDirection={<GradientDirectionField config={config} onChange={onChange} />}
      />
      <AudioAnalyzerFields config={config} onChange={onChange} />
    </>
  );
}
