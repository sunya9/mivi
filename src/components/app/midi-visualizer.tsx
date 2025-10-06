import { formatTime } from "@/lib/utils";
import { Canvas } from "@/components/app/canvas";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { getRendererFromConfig, RendererConfig } from "@/lib/renderers";
import { usePlayer } from "@/lib/player";
import { MidiTracks } from "@/lib/midi";
import { useAnimationFrame } from "@/hooks";

interface Props {
  rendererConfig: RendererConfig;
  audioBuffer?: AudioBuffer;
  midiTracks?: MidiTracks;
  backgroundImageBitmap?: ImageBitmap;
}

export function MidiVisualizer({
  rendererConfig,
  audioBuffer,
  midiTracks,
  backgroundImageBitmap,
}: Props) {
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const renderer = useMemo(() => {
    return context
      ? getRendererFromConfig(context, rendererConfig, backgroundImageBitmap)
      : undefined;
  }, [backgroundImageBitmap, context, rendererConfig]);
  const duration = useMemo(() => audioBuffer?.duration || 0, [audioBuffer]);
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
  } = usePlayer(audioBuffer);
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
  const [expanded, setExpanded] = useState(false);
  const setExpandedAnimation = useCallback(
    (expanded: React.SetStateAction<boolean>) => {
      if (!document.startViewTransition) {
        setExpanded(expanded);
        return;
      }
      document.startViewTransition(() => {
        setExpanded(expanded);
      });
    },
    [],
  );
  const toggleExpanded = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setExpandedAnimation((prev) => !prev);
      e.currentTarget.blur();
    },
    [setExpandedAnimation],
  );

  useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
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

    const handleEsc = (e: KeyboardEvent) => {
      if (e.code !== "Escape" || !expanded) return;
      e.preventDefault();
      setExpandedAnimation(false);
    };

    window.addEventListener("keydown", handleSpace);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleSpace);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [expanded, isPlaying, setExpandedAnimation, togglePlay]);
  const closeExpanded = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.currentTarget === e.target) {
        setExpandedAnimation(false);
      }
    },
    [setExpandedAnimation],
  );
  return (
    <div
      onClick={closeExpanded}
      className={cn("select-none", {
        "relative h-full w-full": !expanded,
        "bg-background/50 fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm":
          expanded,
      })}
      aria-expanded={expanded}
      aria-label="Midi Visualizer Player"
    >
      {expanded && (
        <Button
          variant="icon"
          onClick={closeExpanded}
          className="absolute top-2 right-2 z-10 size-12 rounded-full p-2 sm:top-10 sm:right-10 sm:size-16"
        >
          <X strokeWidth={1} className="size-full" />
          <span className="sr-only">Close</span>
        </Button>
      )}
      <div
        data-is-playing={isPlaying}
        style={
          {
            "--aspect-ratio":
              rendererConfig.resolution.width /
              rendererConfig.resolution.height,
          } as React.CSSProperties
        }
        className={cn("group aspect-[var(--aspect-ratio)] overflow-hidden", {
          "h-full w-full": !expanded,
          "absolute inset-4 m-auto max-h-3/4 max-w-4xl shadow-lg": expanded,
        })}
        aria-modal={expanded}
      >
        <Canvas
          aspectRatio={
            rendererConfig.resolution.height / rendererConfig.resolution.width
          }
          onRedraw={onAnimate}
          onInit={setContext}
          onClickCanvas={togglePlay}
          className="[view-transition-name:visualizer-canvas]"
        />
        <PlayIcon
          isPlaying={isPlaying}
          key={isPlaying ? "playing" : "paused"}
        />
        <div
          className={cn(
            "absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/50 to-black/0 p-2 transition-all duration-500",
            "group-data-[is-playing=true]:translate-y-full group-data-[is-playing=true]:delay-1000",
            "group-data-[is-playing=true]:group-hover:translate-y-0 group-data-[is-playing=true]:group-hover:delay-0",
            "light",
          )}
        >
          <div className="flex items-center gap-2 [view-transition-name:visualizer-controls]">
            <Button onClick={togglePlay} variant="ghostSecondary">
              {isPlaying ? <Pause /> : <Play />}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <div className="flex items-center gap-2">
              <HoverCard openDelay={100}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghostSecondary"
                    onClick={toggleMute}
                    aria-pressed={muted}
                  >
                    {muted ? (
                      <VolumeX className="size-4" />
                    ) : (
                      <Volume2 className="size-4" />
                    )}
                    <span className="sr-only">{muted ? "Unmute" : "Mute"}</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="top" className="light w-48">
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
                    aria-label="Volume"
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
            <Button
              variant="ghostSecondary"
              onClick={toggleExpanded}
              className="hidden md:block"
              aria-haspopup="dialog"
            >
              {expanded ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
              <span className="sr-only">Expand</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  const [showPlayIcon, setShowPlayIcon] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowPlayIcon(false), 500);
    return () => clearTimeout(timer);
  }, []);
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
}
