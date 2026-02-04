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
import { useAudioPlaybackStore } from "@/lib/player/use-audio-playback-store";
import { MidiTracks } from "@/lib/midi/midi";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { usePanelVisibility } from "@/hooks/use-panel-visibility";
import { RendererController } from "./renderer-controller";
import { useHotkeys } from "react-hotkeys-hook";
import { SerializedAudio } from "@/lib/audio/audio";
import { computeFFTAtTime } from "@/lib/audio/fft-precompute";

interface Props {
  rendererConfig: RendererConfig;
  midiTracks?: MidiTracks;
  backgroundImageBitmap?: ImageBitmap;
  serializedAudio?: SerializedAudio;
  /** Ref to the visualizer container for measuring dimensions */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function MidiVisualizer({
  rendererConfig,
  midiTracks,
  backgroundImageBitmap,
  serializedAudio,
  containerRef,
}: Props) {
  const rendererControllerRef = useRef<RendererController>(undefined);

  const {
    snapshot: { duration, volume, muted, isPlaying, position },
    seek,
    togglePlay,
    setVolume,
    toggleMute,
    getPosition,
    syncFromAudioContext,
    getFrequencyData,
  } = useAudioPlaybackStore();
  const [expanded, setExpanded] = useState(false);
  // Blocks animation updates during seek (separate from isInteracting for panel visibility)
  const [isSeeking, setIsSeeking] = useState(false);
  // Tracks playing state before seek interaction (for resuming after seek)
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState(false);
  // Show pre-interaction state during seek to avoid button flickering
  const displayedIsPlaying = isSeeking ? wasPlayingBeforeSeek : isPlaying;

  const {
    panelVisible,
    startInteraction,
    endInteraction,
    showPanel,
    handleMouseMove,
    handleTouchReveal,
  } = usePanelVisibility({ isPlaying });
  const tracks = useMemo(() => midiTracks?.tracks || [], [midiTracks]);
  const midiOffset = useMemo(() => midiTracks?.midiOffset ?? 0, [midiTracks]);
  const invalidate = useCallback(
    (usePrecomputed: boolean = false) => {
      const currentPosition = getPosition();
      // Get frequency data: from real-time analyser during playback, or pre-computed during seek
      let frequencyData = getFrequencyData();
      if (!frequencyData && usePrecomputed && serializedAudio) {
        frequencyData = computeFFTAtTime(serializedAudio, currentPosition, {
          fftSize: rendererConfig.audioVisualizerConfig.fftSize,
          smoothingTimeConstant:
            rendererConfig.audioVisualizerConfig.smoothingTimeConstant,
        });
      }
      rendererControllerRef.current?.render(
        tracks,
        currentPosition + midiOffset,
        frequencyData,
      );
    },
    [
      getPosition,
      getFrequencyData,
      midiOffset,
      tracks,
      serializedAudio,
      rendererConfig.audioVisualizerConfig.fftSize,
      rendererConfig.audioVisualizerConfig.smoothingTimeConstant,
    ],
  );

  const invalidateEffect = useEffectEvent(invalidate);

  useEffect(() => {
    rendererControllerRef.current?.setRendererConfig(rendererConfig);
    // Use pre-computed FFT data for immediate preview when not playing
    invalidateEffect(true);
  }, [rendererConfig]);

  useEffect(() => {
    rendererControllerRef.current?.setBackgroundImageBitmap(
      backgroundImageBitmap,
    );
    // Use pre-computed FFT data for immediate preview when not playing
    invalidateEffect(true);
  }, [backgroundImageBitmap]);

  // Re-render when midiTracks changes (e.g., color presets)
  useEffect(() => {
    // Use pre-computed FFT data for immediate preview when not playing
    invalidateEffect(true);
  }, [midiTracks?.tracks]);

  const handleInit = useCallback((ctx: CanvasRenderingContext2D) => {
    rendererControllerRef.current = new RendererController(ctx);
  }, []);

  const invalidateSeek = useCallback(
    (time: number, commit: boolean, seamless: boolean = false) => {
      seek(time, commit, seamless);
      // Use pre-computed FFT for seek visualization
      invalidate(true);
    },
    [seek, invalidate],
  );

  const onAnimate = useCallback(() => {
    if (!isPlaying || isSeeking) return;
    syncFromAudioContext();
    invalidate();
  }, [isPlaying, isSeeking, syncFromAudioContext, invalidate]);

  useAnimationFrame(isPlaying, onAnimate);

  const handleContainerClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const pointerType = e.pointerType;
      // Touch on mobile: reveal/hide UI without toggling play
      if (pointerType === "touch") {
        const consumed = handleTouchReveal();
        if (consumed) {
          return;
        }
      }
      // Mouse click: toggle play
      togglePlay();
    },
    [handleTouchReveal, togglePlay],
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

  // Space: Play/Pause (allow on body and slider elements)
  useHotkeys(
    "space",
    (e) => {
      const target = e.target;
      if (e.repeat || !(target instanceof HTMLElement)) return;
      const isBody = target instanceof HTMLBodyElement;
      const isSlider = target.role === "slider";
      if (!isBody && !isSlider) return;
      e.preventDefault();
      togglePlay();
    },
    {
      enableOnFormTags: ["slider"],
    },
    [togglePlay],
  );

  // Escape: Exit expanded view
  useHotkeys(
    "escape",
    () => setExpandedAnimation(false),
    { enabled: expanded },
    [expanded, setExpandedAnimation],
  );

  // M: Mute/Unmute (disabled in form inputs)
  useHotkeys(
    "m",
    (e) => {
      if (e.repeat) return;
      e.preventDefault();
      toggleMute();
      showPanel();
    },
    { enableOnFormTags: ["slider"] },
    [toggleMute, showPanel],
  );
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
      className={cn({
        "relative flex h-full w-full items-center justify-center bg-gray-50 bg-[linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas)),linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas))] bg-size-[16px_16px] bg-position-[0_0,8px_8px] dark:bg-gray-600":
          !expanded,
        "bg-background/50 fixed inset-0 z-30 flex items-center justify-center backdrop-blur-sm":
          expanded,
      })}
      aria-expanded={expanded}
      aria-label="Midi Visualizer Player"
      role={expanded ? "dialog" : "region"}
      aria-modal={expanded}
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
        onMouseMove={handleMouseMove}
        onPointerUp={handleContainerClick}
        style={{
          "--aspect-ratio":
            rendererConfig.resolution.width / rendererConfig.resolution.height,
        }}
        className={cn("h-full w-full overflow-hidden", {
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
          className="[view-transition-name:visualizer-canvas]"
        />
        <PlayIcon
          isPlaying={displayedIsPlaying}
          showInteractive={false}
          onTogglePlay={togglePlay}
        />
      </div>
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/50 to-black/0 p-2 transition-all duration-500",
          "hover:translate-y-0",
          {
            "pointer-events-auto translate-y-0": panelVisible,
            "pointer-events-none translate-y-full": !panelVisible,
          },
          "light",
        )}
        aria-label="Midi Visualizer Controls"
      >
        <div className="flex flex-col gap-1 [view-transition-name:visualizer-controls]">
          <Slider
            aria-label="Seek position"
            max={duration}
            value={[position]}
            step={0.1}
            onPointerDown={() => {
              // Capture playing state and stop playback immediately at pointer-down
              setWasPlayingBeforeSeek(isPlaying);
              startInteraction();
              setIsSeeking(true);
              // Stop playback at current position (don't commit so we can resume later)
              invalidateSeek(position, false);
            }}
            onValueChange={([value], reason) => {
              if (reason === "pointer-down" || reason === "drag") {
                // Seek to new position (playback already stopped at pointer-down)
                invalidateSeek(value, false);
              }
              // keyboard: handled only in onValueCommit (seamless)
            }}
            onValueCommit={([value], reason) => {
              if (reason === "keyboard") {
                // Keyboard: seamless seek
                invalidateSeek(value, true, true);
              } else {
                // pointer-down or drag: commit seek and resume if was playing
                invalidateSeek(value, true, false);
                if (wasPlayingBeforeSeek) {
                  togglePlay();
                }
              }
              setWasPlayingBeforeSeek(false);
              endInteraction();
              setIsSeeking(false);
            }}
            className="*:data-[slot=slider-track]:bg-muted/30"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlay}
              variant="ghost-secondary"
              aria-label={displayedIsPlaying ? "Pause" : "Play"}
            >
              {displayedIsPlaying ? <Pause /> : <Play />}
            </Button>
            <Button
              variant="ghost-secondary"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onPointerDown={startInteraction}
              onValueChange={([value]) => setVolume(value)}
              onValueCommit={([value]) => {
                setVolume(value);
                endInteraction();
              }}
              aria-label="Volume"
              className="w-24"
            />
            <span className="flex-1 text-white tabular-nums">
              {formatTime(position)} / {formatTime(duration)}
            </span>
            <Button
              variant="ghost-secondary"
              onClick={toggleExpanded}
              className="hidden md:block"
              aria-haspopup="dialog"
              aria-label={expanded ? "Minimize" : "Maximize"}
            >
              {expanded ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlayIconProps {
  isPlaying: boolean;
  showInteractive?: boolean;
  onTogglePlay?: () => void;
}

function PlayIcon({ isPlaying, showInteractive, onTogglePlay }: PlayIconProps) {
  const isPlayingRef = useRef(isPlaying);
  const isAnimatingRef = useRef(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);

  // Handle play state changes - trigger animation feedback
  useEffect(() => {
    if (isPlayingRef.current === isPlaying) {
      return;
    }

    isAnimatingRef.current = true;

    // Hide interactive layer during animation
    if (interactiveRef.current) {
      interactiveRef.current.style.opacity = "0";
      interactiveRef.current.style.pointerEvents = "none";
    }

    // Play animation feedback
    const animation = animationRef.current?.animate(
      [
        { opacity: 1, transform: "scale(0.8)" },
        { opacity: 0, transform: "scale(1)" },
      ],
      { duration: 500, fill: "forwards" },
    );

    // Show interactive layer after animation completes
    void animation?.finished.then(() => {
      isAnimatingRef.current = false;
      if (showInteractive && interactiveRef.current) {
        interactiveRef.current.style.opacity = "1";
        interactiveRef.current.style.pointerEvents = "auto";
      }
    });

    isPlayingRef.current = isPlaying;
  }, [isPlaying, showInteractive]);

  // Handle showInteractive changes (when not animating)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    if (interactiveRef.current) {
      interactiveRef.current.style.opacity = showInteractive ? "1" : "0";
      interactiveRef.current.style.pointerEvents = showInteractive
        ? "auto"
        : "none";
    }
  }, [showInteractive]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onTogglePlay?.();
    },
    [onTogglePlay],
  );

  return (
    <>
      {/* Animation feedback: shows briefly on state change */}
      <div
        ref={animationRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
      >
        <span className="rounded-full bg-black/50 p-4 text-white">
          {/* Show icon representing the action that just happened */}
          {isPlaying ? (
            <Play strokeWidth={0.5} className="size-12" />
          ) : (
            <Pause strokeWidth={0.5} className="size-12" />
          )}
        </span>
      </div>

      {/* Interactive button: shown when panel is visible during playback */}
      <div
        ref={interactiveRef}
        onClick={handleClick}
        className="pointer-events-none absolute inset-0 flex cursor-pointer items-center justify-center opacity-0"
      >
        <span className="rounded-full bg-black/50 p-4 text-white">
          {/* Show icon representing the action that can be performed */}
          <Pause strokeWidth={0.5} className="size-12" />
        </span>
      </div>
    </>
  );
}
