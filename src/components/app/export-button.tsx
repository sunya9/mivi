import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useMessages } from "@/lib/locale/use-messages";
import { formatEta } from "@/lib/media-compositor/format-eta";
import type { ExportPhase } from "@/lib/media-compositor/media-compositor";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { startViewTransition } from "@/lib/utils";

export function ExportButton() {
  const m = useMessages();
  const { recordingState, toggleRecording } = useRecorder();
  const phaseLabels: Record<ExportPhase, string> = {
    FFT: m.export_phase_fft(),
    Audio: m.export_phase_audio(),
    "Video Render": m.export_phase_video_render(),
    "Video Encode": m.export_phase_video_encode(),
  };
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
          {phaseLabels[recordingState.activePhase.name]} —{" "}
          {formatEta(recordingState.activePhase.etaSeconds)}
        </span>
      )}
      <Button
        onClick={handleToggleRecording}
        className="h-8 px-3 md:h-9 md:px-4 [html:active-view-transition-type(export-button-change)_&]:[view-transition-name:export-button]"
      >
        {recordingState.type === "recording" ? (
          <>
            <Spinner />
            <span>{m.export_stop()}</span>
          </>
        ) : (
          m.export_start()
        )}
      </Button>
      {recordingState.type === "recording" && (
        <Progress
          aria-label={m.export_progress()}
          className="absolute bottom-0 left-0 z-20 w-full animate-in rounded-none duration-300 fade-in *:data-[slot=progress-track]:h-0.5 *:data-[slot=progress-track]:bg-transparent"
          value={recordingState.progress * 100}
        />
      )}
    </>
  );
}
