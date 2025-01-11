import { FormRow } from "@/components/FormRow";
import { Input } from "@/components/ui/input";
import { RendererConfig } from "@/types/renderer";

interface Props {
  config: RendererConfig["waveformConfig"];
  onChange: (config: Partial<RendererConfig["waveformConfig"]>) => void;
}

export function WaveformConfigPanel({ config, onChange }: Props) {
  return (
    <>
      <FormRow
        Label={() => <>Line Color</>}
        Controller={() => (
          <input
            type="color"
            value={config.lineColor}
            onChange={(e) => onChange({ lineColor: e.target.value })}
          />
        )}
      />
      <FormRow
        Label={() => <>Line Width</>}
        Controller={() => (
          <Input
            type="number"
            value={config.lineWidth}
            onChange={(e) => onChange({ lineWidth: +e.target.value })}
          />
        )}
      />
    </>
  );
}
