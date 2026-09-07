import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { startViewTransition } from "@/lib/utils";

export function ExportButton() {
  const { recordingState, toggleRecording } = useRecorder();
  const handleToggleRecording = useCallback(() => {
    startViewTransition(
      () => {
        void toggleRecording();
      },
      { types: ["export-button-change"] },
    );
  }, [toggleRecording]);

  return (
    <>
      {recordingState.type === "recording" && recordingState.activePhase && (
        <span className="hidden text-muted-foreground tabular-nums md:inline md:text-xs">
          {recordingState.activePhase.name} — {recordingState.activePhase.eta}
        </span>
      )}
      <Button
        onClick={handleToggleRecording}
        className="h-8 px-3 md:h-9 md:px-4 [html:active-view-transition-type(export-button-change)_&]:[view-transition-name:export-button]"
      >
        {recordingState.type === "recording" ? (
          <>
            <Spinner />
            <span>Stop export</span>
          </>
        ) : (
          "Start export"
        )}
      </Button>
      {recordingState.type === "recording" && (
        <Progress
          aria-label="Export progress"
          className="absolute bottom-0 left-0 z-20 w-full animate-in rounded-none duration-300 fade-in *:data-[slot=progress-track]:h-0.5 *:data-[slot=progress-track]:bg-transparent"
          value={recordingState.progress * 100}
        />
      )}
    </>
  );
}
