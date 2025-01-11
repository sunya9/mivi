import {
  RendererConfig,
  RendererType,
  resolutions,
  fpsOptions,
  FPS,
} from "@/types/renderer";
import { PianoRollConfigPanel } from "./rendererConfig/PianoRollConfig";
import { WaveformConfigPanel } from "./rendererConfig/WaveformConfig";
import { ParticlesConfigPanel } from "./rendererConfig/ParticlesConfig";
import { DeepPartial } from "@/types/util";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormRow } from "@/components/FormRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  config: RendererConfig;
  onChange: (config: DeepPartial<RendererConfig>) => void;
}

export function RendererConfigPane({ config, onChange }: Props) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @[480px]:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Common settings</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormRow
              Label={() => <>Background Color</>}
              Controller={() => (
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    onChange({ backgroundColor: e.target.value })
                  }
                />
              )}
            />
            <FormRow
              Label={() => <>Resolution</>}
              Controller={() => (
                <Select
                  value={`${config.resolution.width}x${config.resolution.height}`}
                  onValueChange={(value) => {
                    const [width, height] = value.split("x").map(Number);
                    const resolution = resolutions.find(
                      (r) => r.width === width && r.height === height,
                    );
                    if (resolution) {
                      onChange({ resolution });
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutions.map((resolution) => (
                      <SelectItem
                        key={resolution.label}
                        value={`${resolution.width}x${resolution.height}`}
                      >
                        {resolution.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormRow
              Label={() => <>Frame Rate</>}
              Controller={() => (
                <Select
                  value={config.fps.toString()}
                  onValueChange={(value) => {
                    const fps = +value as FPS;
                    onChange({ fps });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select frame rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {fpsOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Note Style</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormRow
              Label={() => <>Style</>}
              Controller={() => (
                <Select
                  value={config.type}
                  onValueChange={(value: RendererType) =>
                    onChange({ ...config, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      className="display w-auto"
                      placeholder="Select visualization style"
                    />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="pianoRoll">Piano Roll</SelectItem>
                    <SelectItem value="waveform">Waveform</SelectItem>
                    <SelectItem value="particles">Particles</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {config.type === "pianoRoll" && (
              <PianoRollConfigPanel
                config={config.pianoRollConfig}
                onChange={(pianoRollConfig) =>
                  onChange({
                    pianoRollConfig,
                  })
                }
              />
            )}
            {config.type === "waveform" && (
              <WaveformConfigPanel
                config={config.waveformConfig}
                onChange={(waveformConfig) =>
                  onChange({
                    waveformConfig,
                  })
                }
              />
            )}
            {config.type === "particles" && (
              <ParticlesConfigPanel
                config={config.particlesConfig}
                onChange={(particlesConfig) =>
                  onChange({
                    particlesConfig,
                  })
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
