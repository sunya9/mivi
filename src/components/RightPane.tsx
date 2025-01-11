import { MidiVisualizer } from "./MidiVisualizer";
import { AudioHandler } from "@/lib/AudioHandler";
import { MidiState } from "@/types/midi";
import { Button } from "@/components/ui/button";
import { useStartRecording } from "@/lib/useStartRecording";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import humanizeDuration from "humanize-duration";
import { RendererConfig } from "@/types/renderer";
import { RendererConfigPane } from "@/components/RendererConfigPane";
import { DeepPartial } from "@/types/util";

interface Props {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
  rendererConfig: RendererConfig;
  onRendererConfigChange: (config: DeepPartial<RendererConfig>) => void;
}

export const RightPane = ({
  midiState,
  audioHandler,
  rendererConfig,
  onRendererConfigChange,
}: Props) => {
  const { recordingState, toggleRecording } = useStartRecording(
    midiState,
    audioHandler,
  );

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-4 flex-1">
        <MidiVisualizer
          audioHandler={audioHandler}
          midiState={midiState}
          rendererConfig={rendererConfig}
        />
      </div>
      <div className="py-4">
        <div className="space-y-4">
          <div>
            <RendererConfigPane
              config={rendererConfig}
              onChange={onRendererConfigChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              disabled={recordingState.disabled}
              onClick={() => toggleRecording(rendererConfig)}
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
