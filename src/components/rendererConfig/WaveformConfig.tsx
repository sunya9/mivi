import { FormRow } from "@/components/FormRow";
import { Input } from "@/components/ui/input";
import { RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
}
export function WaveformConfigPanel({
  rendererConfig,
  onUpdateRendererConfig,
}: Props) {
  return (
    <>
      <FormRow
        Label={() => <>Line Color</>}
        Controller={() => (
          <input
            type="color"
            value={rendererConfig.waveformConfig.lineColor}
            onChange={(e) =>
              onUpdateRendererConfig({
                waveformConfig: {
                  lineColor: e.target.value,
                },
              })
            }
          />
        )}
      />
      <FormRow
        Label={() => <>Line Width</>}
        Controller={() => (
          <Input
            type="number"
            value={rendererConfig.waveformConfig.lineWidth}
            onChange={(e) =>
              onUpdateRendererConfig({
                waveformConfig: {
                  lineWidth: +e.target.value,
                },
              })
            }
          />
        )}
      />
    </>
  );
}
