import { MidiVisualizer } from "./MidiVisualizer";
import { AudioHandler } from "@/lib/AudioHandler";
import { MidiState } from "@/types/midi";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStartRecording } from "@/lib/useStartRrecording";
import { getRendererFromName } from "@/lib/utils";
interface Props {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
}

export const RightPane = ({ midiState, audioHandler }: Props) => {
  const [rendererName, setRendererName] = useState<string>("pianoRoll");

  const startRecording = useStartRecording(
    audioHandler,
    midiState,
    rendererName,
  );
  const rendererCreator = useCallback(
    (ctx: CanvasRenderingContext2D) => getRendererFromName(rendererName, ctx),
    [rendererName],
  );
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-4 flex-1">
        <MidiVisualizer
          rendererCreator={rendererCreator}
          audioHandler={audioHandler}
          midiState={midiState}
        />
      </div>
      <div className="p-4 shadow">
        <h3 className="mb-4 text-lg font-bold">Visualizer Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block">
              Visualization Style:
              <Select onValueChange={setRendererName} value={rendererName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a renderer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pianoRoll">Piano Roll</SelectItem>
                  <SelectItem value="waveform">Waveform</SelectItem>
                  <SelectItem value="particles">Particles</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="default" onClick={startRecording}>
              録画開始
            </Button>
            <Button variant="outline">録画停止</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
