import { Toolbar, ToolbarButton } from "@/components/Toolbar";
import { Progress } from "@/components/ui/progress";
import { useStartRecording } from "@/lib/useStartRecording";
import humanizeDuration from "humanize-duration";
import { Loader2 } from "lucide-react";
import { MidiState } from "@/types/midi";
import { AudioHandler } from "@/lib/AudioHandler";
import { RendererConfig } from "@/types/renderer";

interface Props {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
  rendererConfig: RendererConfig;
}

export const AppToolbar = ({
  midiState,
  audioHandler,
  rendererConfig,
}: Props) => {
  const { recordingState, toggleRecording } = useStartRecording(
    midiState,
    audioHandler,
  );
  return (
    <Toolbar>
      <div className="ml-auto flex items-center gap-2">
        {recordingState.type === "recording" && (
          <>
            <span>{recordingState.statusText}</span>
            <span>
              ETA:{" "}
              {humanizeDuration(recordingState.eta.estimate, {
                maxDecimalPoints: 2,
              })}
            </span>
            <Progress className="w-32" value={recordingState.progress * 100} />
          </>
        )}

        <ToolbarButton
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
        </ToolbarButton>
      </div>
    </Toolbar>
  );
};
