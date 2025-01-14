import { rendererConfigAtom } from "@/atoms/rendererConfigAtom";
import { FormRow } from "@/components/FormRow";
import { Slider } from "@/components/ui/slider";
import { useAtom } from "jotai";

export function ParticlesConfigPanel() {
  const [rendererConfig, setRendererConfig] = useAtom(rendererConfigAtom);
  return (
    <>
      <FormRow
        Label={() => <>Particle Color</>}
        Controller={() => (
          <input
            type="color"
            value={rendererConfig.particlesConfig.particleColor}
            onChange={(e) =>
              setRendererConfig({
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
              setRendererConfig({
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
