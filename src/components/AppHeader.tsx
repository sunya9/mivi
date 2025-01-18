import { Progress } from "@/components/ui/progress";
import { useStartRecording } from "@/lib/useStartRecording";
import humanizeDuration from "humanize-duration";
import { Loader2 } from "lucide-react";
import { rendererConfigAtom } from "@/atoms/rendererConfigAtom";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}
export const AppHeader = ({ className }: Props) => {
  const rendererConfig = useAtomValue(rendererConfigAtom);

  const { recordingState, toggleRecording } = useStartRecording();
  return (
    <div className={cn("border-b bg-white/90 shadow-sm", className)}>
      <div className="items-bottom container flex flex-col justify-between p-6 md:flex-row md:items-baseline">
        <div className="items-baseline gap-2 sm:inline-flex">
          <h1 className="text-7xl font-bold">MiVi</h1>
          <p className="-mt-2 text-xl font-medium text-muted-foreground sm:mt-0">
            <span className="text-accent-foreground">MI</span>DI{" "}
            <span className="text-accent-foreground">Vi</span>sualizer
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 md:ml-auto md:mt-0 md:flex-row md:items-center">
          {recordingState.type === "recording" && (
            <>
              <span>{recordingState.statusText}</span>
              <span>
                ETA:{" "}
                {humanizeDuration(recordingState.eta.estimate, {
                  maxDecimalPoints: 2,
                })}
              </span>
              <Progress
                className="w-full md:w-32"
                value={recordingState.progress * 100}
              />
            </>
          )}
          <Button
            disabled={recordingState.disabled}
            onClick={() => toggleRecording(rendererConfig)}
            className="order-1 md:order-4"
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
        </div>
      </div>
    </div>
  );
};
