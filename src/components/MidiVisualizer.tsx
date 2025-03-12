import { formatTime, getRendererFromConfig } from "@/lib/utils";
import { Canvas } from "@/components/Canvas";
import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { RendererConfig } from "@/types/renderer";
import { usePlayer } from "@/lib/usePlayer";
import { MidiTracks } from "@/types/midi";
import { useAnimationFrame } from "@/lib/useAnimationFrame";

interface Props {
  rendererConfig: RendererConfig;
  audioBuffer?: AudioBuffer;
  duration: number;
  midiTracks?: MidiTracks;
}

export const MidiVisualizer = ({
  rendererConfig,
  audioBuffer,
  duration,
  midiTracks,
}: Props) => {
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const renderer = useMemo(() => {
    return context ? getRendererFromConfig(context, rendererConfig) : undefined;
  }, [context, rendererConfig]);
  const {
    seek,
    togglePlay,
    volume,
    setVolume,
    muted,
    isPlaying,
    getCurrentTime,
    updateCurrentTime,
    currentTimeSec,
    toggleMute,
    makeSureToCommit,
  } = usePlayer({ audioBuffer, duration });
  const onAnimate = useCallback(() => {
    if (!renderer) return;
    renderer.render(midiTracks?.tracks || [], {
      currentTime: getCurrentTime(),
      duration,
    });
    if (!isPlaying) return;
    updateCurrentTime();
  }, [
    duration,
    getCurrentTime,
    isPlaying,
    midiTracks,
    renderer,
    updateCurrentTime,
  ]);
  useAnimationFrame(onAnimate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        !(activeElement instanceof HTMLElement) ||
        e.code !== "Space" ||
        e.repeat
      )
        return;
      if (activeElement === document.body || activeElement.role === "slider") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, togglePlay]);
  return (
    <div
      className="group relative h-full w-full select-none"
      data-is-playing={isPlaying}
    >
      <Canvas
        aspectRatio={
          rendererConfig.resolution.height / rendererConfig.resolution.width
        }
        onRedraw={onAnimate}
        onInit={setContext}
        onClickCanvas={togglePlay}
      />
      <PlayIcon isPlaying={isPlaying} />
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/50 to-black/0 p-2 transition-opacity",
          "group-data-[is-playing=true]:opacity-0 group-data-[is-playing=true]:group-hover:opacity-100",
        )}
      >
        <div className="flex items-center gap-2">
          <Button onClick={togglePlay} variant="ghostSecondary">
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <div className="flex items-center gap-2">
            <HoverCard openDelay={100}>
              <HoverCardTrigger asChild>
                <Button variant="ghostSecondary" onClick={toggleMute}>
                  {muted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-48">
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => {
                    setVolume(value);
                  }}
                  onValueCommit={([value]) => {
                    setVolume(value);
                  }}
                />
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className="mr-2 min-w-28 text-right text-white">
            {formatTime(currentTimeSec)} / {formatTime(duration)}
          </span>
          <Slider
            max={duration}
            value={[currentTimeSec]}
            step={0.1}
            onValueChange={([e]) => seek(e, false)}
            onValueCommit={([e]) => seek(e, true)}
            // https://github.com/radix-ui/primtives/issues/1760#issuecomment-2133137759
            onLostPointerCapture={makeSureToCommit}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

const PlayIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  useEffect(() => {
    setShowPlayIcon(true);
    const timer = setTimeout(() => setShowPlayIcon(false), 500);
    return () => clearTimeout(timer);
  }, [isPlaying]);
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-4 text-white transition-opacity duration-200",
        showPlayIcon ? "opacity-100" : "opacity-0",
      )}
    >
      {isPlaying ? (
        <Play strokeWidth={0.5} className="size-12" />
      ) : (
        <Pause strokeWidth={0.5} className="size-12" />
      )}
    </div>
  );
};
