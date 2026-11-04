import { FormRow } from "@/components/common/form-row";
import { SliderRow } from "@/components/common/slider-row";
import { Switch } from "@/components/ui/switch";
import { SpectrumPlacementConfig } from "@/lib/renderers/renderer-config";

import { ConfigFieldsProps } from "./types";

type MirrorConfig = Pick<SpectrumPlacementConfig, "mirror" | "mirrorOpacity">;

export function MirrorFields({ config, onChange }: ConfigFieldsProps<MirrorConfig>) {
  return (
    <>
      <FormRow
        label={<span>Mirror</span>}
        controller={({ id }) => (
          <Switch
            id={id}
            checked={config.mirror}
            onCheckedChange={(checked) => onChange({ mirror: checked })}
          />
        )}
      />
      {config.mirror && (
        <SliderRow
          label={<span>Mirror Opacity: {Math.round(config.mirrorOpacity * 100)}%</span>}
          value={[config.mirrorOpacity]}
          min={0.1}
          max={1}
          step={0.1}
          onValueChange={([value]) => onChange({ mirrorOpacity: value })}
        />
      )}
    </>
  );
}
