import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { RendererConfig } from "@/types/renderer";

interface Props {
  config: RendererConfig["particlesConfig"];
  onChange: (config: Partial<RendererConfig["particlesConfig"]>) => void;
}

export function ParticlesConfigPanel({ config, onChange }: Props) {
  return (
    <>
      <FormRow
        Label={() => <>Particle Color</>}
        Controller={() => (
          <input
            type="color"
            value={config.particleColor}
            onChange={(e) =>
              onChange({
                particleColor: e.target.value,
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
            value={[config.particleSize]}
            min={1}
            max={10}
            step={0.5}
            onValueChange={([value]) =>
              onChange({
                particleSize: +value,
              })
            }
          />
        )}
      />
    </>
  );
}
