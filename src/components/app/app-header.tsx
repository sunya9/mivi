import { useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecordingStatus } from "@/lib/media-compositor/recording-status";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  className?: string;
  recordingState: RecordingStatus;
  toggleRecording(): void;
}
export function AppHeader({
  className,
  recordingState,
  toggleRecording,
}: Props) {
  const handleToggleRecording = useCallback(() => {
    if (!document.startViewTransition) {
      toggleRecording();
      return;
    }
    document.startViewTransition({
      update: () => {
        toggleRecording();
      },
      types: ["export-button-change"],
    });
  }, [toggleRecording]);

  return (
    <div className={cn("relative border-b shadow-xs", className)}>
      <div className="mx-auto flex max-w-384 items-center justify-between gap-2 px-4 py-2 md:flex-row md:items-end md:p-6">
        <div className="inline-flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tighter md:text-7xl">
            MiVi
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-tighter md:text-xl">
            <span className="text-accent-foreground">MI</span>DI{" "}
            <span className="text-accent-foreground">Vi</span>sualizer
          </p>
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button
            onClick={handleToggleRecording}
            className="h-8 px-3 [view-transition-name:export-button] md:h-9 md:px-4"
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
        </div>
      </div>
      {recordingState.type === "recording" && (
        <Progress
          aria-label="Export progress"
          className="animate-in fade-in absolute bottom-0 left-0 z-10 h-1 w-full rounded-none duration-300"
          value={recordingState.progress * 100}
        />
      )}
    </div>
  );
}
