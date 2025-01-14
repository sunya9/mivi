import { rendererConfigAtom } from "@/atoms/rendererConfigAtom";
import { FormRow } from "@/components/FormRow";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";

export function WaveformConfigPanel() {
  const [rendererConfig, setRendererConfig] = useAtom(rendererConfigAtom);

  return (
    <>
      <FormRow
        Label={() => <>Line Color</>}
        Controller={() => (
          <input
            type="color"
            value={rendererConfig.waveformConfig.lineColor}
            onChange={(e) =>
              setRendererConfig({
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
              setRendererConfig({
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
