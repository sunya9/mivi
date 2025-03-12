import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
}
export function ParticlesConfigPanel({
  rendererConfig,
  onUpdateRendererConfig,
}: Props) {
  return (
    <>
      <FormRow
        Label={() => <>Particle Color</>}
        Controller={() => (
          <input
            type="color"
            value={rendererConfig.particlesConfig.particleColor}
            onChange={(e) =>
              onUpdateRendererConfig({
                particlesConfig: {
                  particleColor: e.target.value,
                },
              })
            }
          />
        )}
      />
      <FormRow
        Label={() => <>Particle Size</>}
        Controller={() => (
          <Slider
            className="w-48"
            value={[rendererConfig.particlesConfig.particleSize]}
            min={1}
            max={10}
            step={0.5}
            onValueChange={([value]) =>
              onUpdateRendererConfig({
                particlesConfig: {
                  particleSize: +value,
                },
              })
            }
          />
        )}
      />
    </>
  );
}
