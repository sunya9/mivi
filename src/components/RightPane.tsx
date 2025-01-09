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
import { useStartRecording } from "@/lib/useStartRecording";
import { getRendererFromName } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RendererCreator } from "@/renderers/Renderer";
import { Loader2 } from "lucide-react";
import humanizeDuration from "humanize-duration";
interface Props {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
}

export const RightPane = ({ midiState, audioHandler }: Props) => {
  const [rendererName, setRendererName] = useState<string>("pianoRoll");

  const { startRecording, recordingState, stopRecording } = useStartRecording();
  // audioHandler,
  // midiState,
  // rendererName,
  const rendererCreator: RendererCreator = useCallback(
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

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              disabled={recordingState.disabled}
              onClick={() =>
                !recordingState.isRecording
                  ? startRecording(
                      1280,
                      720,
                      rendererName,
                      midiState,
                      audioHandler,
                    )
                  : stopRecording()
              }
            >
              {recordingState.isRecording ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  <span>Stop export</span>
                </>
              ) : (
                "Start export"
              )}
            </Button>

            {recordingState.type === "recording" && (
              <div>
                <div>
                  <Progress value={recordingState.progress * 100} />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{recordingState.statusText}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        ETA:{" "}
                        {humanizeDuration(recordingState.eta.estimate, {
                          maxDecimalPoints: 2,
                        })}
                      </p>
                      <p>Progress: {recordingState.eta.progressLeft}</p>
                      <p>Speed: {recordingState.eta.speed.toFixed(2)}</p>
                      <p>
                        TimeDelta: {recordingState.eta.timeDelta.toFixed(2)}
                      </p>
                      <p>
                        AverageTime: {recordingState.eta.averageTime.toFixed(2)}
                        /s
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
