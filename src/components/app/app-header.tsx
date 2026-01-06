import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecordingStatus } from "@/lib/media-compositor/recording-status";

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
  return (
    <div className={cn("border-b shadow-xs", className)}>
      <div className="mx-auto flex max-w-384 items-center justify-between gap-2 px-4 py-2 md:flex-row md:items-baseline md:p-6">
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
          {recordingState.type === "recording" && (
            <>
              <span id="recording-progress" className="text-sm">
                Exporting…
              </span>
              <Progress
                aria-labelledby="recording-progress"
                className="w-20 md:w-32"
                value={recordingState.progress * 100}
              />
            </>
          )}
          <Button onClick={toggleRecording} className="h-8 px-3 md:h-9 md:px-4">
            {recordingState.isRecording ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Stop export</span>
              </>
            ) : (
              "Start export"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
