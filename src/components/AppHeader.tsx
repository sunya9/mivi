import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecordingStatus } from "@/lib/RecordingStatus";

interface Props {
  className?: string;
  recordingState: RecordingStatus;
  toggleRecording(): void;
}
export const AppHeader = ({
  className,
  recordingState,
  toggleRecording,
}: Props) => {
  return (
    <div
      className={cn(
        "border-b bg-white/90 shadow-xs dark:bg-zinc-800/90",
        className,
      )}
    >
      <div className="items-bottom container flex flex-col justify-between p-6 md:flex-row md:items-baseline">
        <div className="items-baseline gap-2 sm:inline-flex">
          <h1 className="text-7xl font-bold tracking-tighter">MiVi</h1>
          <p className="text-muted-foreground -mt-2 text-xl font-medium tracking-tighter sm:mt-0">
            <span className="text-accent-foreground">MI</span>DI{" "}
            <span className="text-accent-foreground">Vi</span>sualizer
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 md:mt-0 md:ml-auto md:flex-row md:items-center">
          {recordingState.type === "recording" && (
            <>
              <span id="recording-progress">Exporting…</span>
              <Progress
                aria-labelledby="recording-progress"
                className="w-full md:w-32"
                value={recordingState.progress * 100}
              />
            </>
          )}
          <Button
            onClick={() => toggleRecording()}
            className="order-1 md:order-4"
          >
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
};
