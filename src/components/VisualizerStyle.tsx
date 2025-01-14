import { RendererType } from "@/types/renderer";
import { PianoRollConfigPanel } from "./rendererConfig/PianoRollConfig";
import { WaveformConfigPanel } from "./rendererConfig/WaveformConfig";
import { ParticlesConfigPanel } from "./rendererConfig/ParticlesConfig";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormRow } from "@/components/FormRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rendererConfigAtom } from "@/atoms/rendererConfigAtom";
import { useAtom } from "jotai";

export function VisualizerStyle() {
  const [rendererConfig, setRendererConfig] = useAtom(rendererConfigAtom);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>
          <h2>Visualizer Style</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormRow
          Label={() => <>Style</>}
          Controller={() => (
            <Select
              value={rendererConfig.type}
              onValueChange={(value: RendererType) =>
                setRendererConfig({ type: value })
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
        {rendererConfig.type === "pianoRoll" && <PianoRollConfigPanel />}
        {rendererConfig.type === "waveform" && <WaveformConfigPanel />}
        {rendererConfig.type === "particles" && <ParticlesConfigPanel />}
      </CardContent>
    </Card>
  );
}
