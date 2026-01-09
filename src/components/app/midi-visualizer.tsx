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
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { RendererConfig } from "@/lib/renderers/renderer";
import { usePlayer } from "@/lib/player/use-player";
import { MidiTracks } from "@/lib/midi/midi";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { RendererController } from "./renderer-controller";

interface Props {
  rendererConfig: RendererConfig;
  audioBuffer?: AudioBuffer;
  midiTracks?: MidiTracks;
  backgroundImageBitmap?: ImageBitmap;
  /** Ref to the visualizer container for measuring dimensions */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function MidiVisualizer({
  rendererConfig,
  audioBuffer,
  midiTracks,
  backgroundImageBitmap,
  containerRef,
}: Props) {
  const rendererControllerRef = useRef<RendererController>(undefined);

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
  const [expanded, setExpanded] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isTouchRevealed, setIsTouchRevealed] = useState(false);
  const touchRevealTimeoutRef = useRef<number>(null);

  const invalidate = useCallback(() => {
    rendererControllerRef.current?.render(
      midiTracks?.tracks || [],
      getCurrentTime() + (midiTracks?.midiOffset ?? 0),
    );
  }, [getCurrentTime, midiTracks?.midiOffset, midiTracks?.tracks]);

  const invalidateEffect = useEffectEvent(invalidate);

  useEffect(() => {
    rendererControllerRef.current?.setRendererConfig(rendererConfig);
    invalidateEffect();
  }, [rendererConfig]);

  useEffect(() => {
    rendererControllerRef.current?.setBackgroundImageBitmap(
      backgroundImageBitmap,
    );
    invalidateEffect();
  }, [backgroundImageBitmap]);

  // Re-render when midiTracks changes (e.g., color presets)
  useEffect(() => {
    invalidateEffect();
  }, [midiTracks?.tracks]);

  const handleInit = useCallback((ctx: CanvasRenderingContext2D) => {
    rendererControllerRef.current = new RendererController(ctx);
  }, []);

  const invalidateSeek = useCallback(
    (time: number, commit: boolean) => {
      seek(time, commit);
      invalidate();
    },
    [seek, invalidate],
  );

  const onAnimate = useCallback(() => {
    if (!isPlaying) return;
    updateCurrentTime();
    invalidate();
  }, [isPlaying, updateCurrentTime, invalidate]);

  useAnimationFrame(isPlaying, onAnimate);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchRevealTimeoutRef.current) {
        clearTimeout(touchRevealTimeoutRef.current);
      }
    };
  }, []);

  const handleCanvasClick = useCallback(
    (pointerType: string) => {
      // Touch on mobile: reveal UI first, then toggle play on second tap
      if (pointerType === "touch" && isPlaying && !isTouchRevealed) {
        setIsTouchRevealed(true);
        if (touchRevealTimeoutRef.current) {
          clearTimeout(touchRevealTimeoutRef.current);
        }
        touchRevealTimeoutRef.current = window.setTimeout(() => {
          setIsTouchRevealed(false);
        }, 3000);
        return;
      }
      // Mouse or second touch: toggle play
      togglePlay();
      // Reset touch reveal state
      if (isTouchRevealed) {
        setIsTouchRevealed(false);
        if (touchRevealTimeoutRef.current) {
          clearTimeout(touchRevealTimeoutRef.current);
        }
      }
    },
    [isPlaying, isTouchRevealed, togglePlay],
  );
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
        "relative flex h-full w-full items-center justify-center bg-gray-50 bg-[linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas)),linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas))] bg-size-[16px_16px] bg-position-[0_0,8px_8px] dark:bg-gray-600":
          !expanded,
        "bg-background/50 fixed inset-0 z-30 flex items-center justify-center backdrop-blur-sm":
          expanded,
      })}
      aria-expanded={expanded}
      aria-label="Midi Visualizer Player"
    >
      {expanded && (
        <Button
          variant="icon"
          onClick={closeExpanded}
          className="absolute top-2 right-2 z-50 size-12 rounded-full p-2 sm:top-10 sm:right-10 sm:size-16"
        >
          <X strokeWidth={1} className="size-full" aria-label="Close" />
        </Button>
      )}
      <div
        ref={containerRef}
        data-is-playing={isPlaying}
        data-is-interacting={isInteracting}
        data-is-touch-revealed={isTouchRevealed}
        style={
          {
            "--aspect-ratio":
              rendererConfig.resolution.width /
              rendererConfig.resolution.height,
          } as React.CSSProperties
        }
        className={cn("group aspect-(--aspect-ratio) overflow-hidden", {
          "max-h-full max-w-full": !expanded,
          "absolute inset-4 m-auto max-h-3/4 max-w-4xl shadow-lg": expanded,
        })}
        aria-modal={expanded}
      >
        <Canvas
          aspectRatio={
            rendererConfig.resolution.height / rendererConfig.resolution.width
          }
          invalidate={invalidate}
          onInit={handleInit}
          onClickCanvas={handleCanvasClick}
          className="[view-transition-name:visualizer-canvas]"
        />
        <PlayIcon isPlaying={isPlaying} />
        <div
          className={cn(
            "absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/50 to-black/0 p-2 transition-all duration-500",
            "group-data-[is-playing=true]:group-not-data-[is-interacting=true]:group-not-data-[is-touch-revealed=true]:translate-y-full group-data-[is-playing=true]:group-not-data-[is-interacting=true]:group-not-data-[is-touch-revealed=true]:delay-3000",
            "group-data-[is-playing=true]:group-not-data-[is-interacting=true]:group-not-data-[is-touch-revealed=true]:group-hover:translate-y-0 group-data-[is-playing=true]:group-not-data-[is-interacting=true]:group-not-data-[is-touch-revealed=true]:group-hover:delay-0",
            "light",
          )}
        >
          <div className="flex flex-col gap-1 [view-transition-name:visualizer-controls]">
            <Slider
              max={duration}
              value={[currentTimeSec]}
              step={0.1}
              onPointerDown={() => setIsInteracting(true)}
              onValueChange={([e]) => invalidateSeek(e, false)}
              onValueCommit={([e]) => {
                invalidateSeek(e, true);
                setIsInteracting(false);
              }}
              // https://github.com/radix-ui/primitives/issues/1760#issuecomment-2133137759
              onLostPointerCapture={() => {
                makeSureToCommit();
                setIsInteracting(false);
              }}
              className="*:data-[slot=slider-track]:bg-muted/30"
            />
            <div className="flex items-center gap-2">
              <Button onClick={togglePlay} variant="ghost-secondary">
                {isPlaying ? (
                  <Pause aria-label="Pause" />
                ) : (
                  <Play aria-label="Play" />
                )}
              </Button>
              <Button
                variant="ghost-secondary"
                onClick={toggleMute}
                aria-pressed={muted}
              >
                {muted ? (
                  <VolumeX className="size-4" aria-label="Unmute" />
                ) : (
                  <Volume2 className="size-4" aria-label="Mute" />
                )}
              </Button>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onPointerDown={() => setIsInteracting(true)}
                onValueChange={([value]) => {
                  setVolume(value);
                }}
                onValueCommit={([value]) => {
                  setVolume(value);
                  setIsInteracting(false);
                }}
                onLostPointerCapture={() => setIsInteracting(false)}
                aria-label="Volume"
                className="w-24"
              />
              <span className="flex-1 text-white tabular-nums">
                {formatTime(currentTimeSec)} / {formatTime(duration)}
              </span>
              <Button
                variant="ghost-secondary"
                onClick={toggleExpanded}
                className="hidden md:block"
                aria-haspopup="dialog"
              >
                {expanded ? (
                  <Minimize className="size-4" aria-label="Minimize" />
                ) : (
                  <Maximize className="size-4" aria-label="Maximize" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  const isPlayingRef = useRef(isPlaying);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlayingRef.current === isPlaying) {
      return;
    }
    ref.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 500,
      fill: "forwards",
    });
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0",
      )}
    >
      <span className="rounded-full bg-black/50 p-4 text-white">
        {isPlaying ? (
          <Play strokeWidth={0.5} className="size-12" />
        ) : (
          <Pause strokeWidth={0.5} className="size-12" />
        )}
      </span>
    </div>
  );
}
