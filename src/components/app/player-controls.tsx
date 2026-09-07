import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { isEffectivelyPlaying } from "@/lib/player/audio-playback-store";
import { cn, formatTime } from "@/lib/utils";
import { type FpsCounter } from "@/lib/visualizer/fps-counter";

interface InteractionProps {
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}

export function SeekSlider({ onInteractionStart, onInteractionEnd }: InteractionProps) {
  const { audioPlaybackStore: store } = useAppContext();
  const position = useStore(store, (snapshot) => snapshot.position);
  const duration = useStore(store, (snapshot) => snapshot.duration);
  return (
    <Slider
      aria-label="Seek position"
      thumbAlignment="center"
      max={duration || Infinity}
      value={[position]}
      step={0.1}
      onPointerDown={() => {
        onInteractionStart();
        store.beginScrub();
      }}
      onValueChange={([value], { reason }) => {
        if (reason === "track-press" || reason === "drag") {
          store.scrub(value);
        }
      }}
      onValueCommitted={([value], { reason }) => {
        if (reason === "keyboard") {
          store.seek(value);
        } else {
          store.endScrub(value);
        }
        onInteractionEnd();
      }}
      className={cn(
        "group",
        "**:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:rounded-none **:data-[slot=slider-track]:bg-muted/30",
        "**:data-[slot=slider-range]:h-1",
        "**:data-[slot=slider-thumb]:opacity-0 **:data-[slot=slider-thumb]:transition-[color,box-shadow,opacity]",
        "**:group-hover:data-[slot=slider-thumb]:opacity-100",
      )}
    />
  );
}

export function PlayPauseButton() {
  const { audioPlaybackStore: store } = useAppContext();
  const playing = useStore(store, isEffectivelyPlaying);
  return (
    <Button
      onClick={store.togglePlay}
      variant="ghost-secondary"
      size="icon-lg"
      aria-label={playing ? "Pause" : "Play"}
    >
      {playing ? <Pause /> : <Play />}
    </Button>
  );
}

export function MuteButton() {
  const { audioPlaybackStore: store } = useAppContext();
  const muted = useStore(store, (snapshot) => snapshot.muted);
  return (
    <Button
      variant="ghost-secondary"
      size="icon-lg"
      onClick={store.toggleMute}
      aria-pressed={muted}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? <VolumeX /> : <Volume2 />}
    </Button>
  );
}

export function VolumeSlider({ onInteractionStart, onInteractionEnd }: InteractionProps) {
  const { audioPlaybackStore: store } = useAppContext();
  const volume = useStore(store, (snapshot) => snapshot.volume);
  return (
    <Slider
      value={[volume]}
      min={0}
      max={1}
      step={0.01}
      onPointerDown={onInteractionStart}
      onValueChange={([value]) => store.setVolume(value)}
      onValueCommitted={([value]) => {
        store.setVolume(value);
        onInteractionEnd();
      }}
      aria-label="Volume"
      className="basis-24 **:data-[slot=slider-track]:bg-muted/30"
    />
  );
}

export function PlaybackTime() {
  const { audioPlaybackStore: store } = useAppContext();
  const position = useStore(store, (snapshot) => Math.floor(snapshot.position));
  const duration = useStore(store, (snapshot) => snapshot.duration);
  return (
    <span className="flex-1 text-sm text-muted tabular-nums">
      {formatTime(position)} / {formatTime(duration)}
    </span>
  );
}

export function FpsIndicator({ counter }: { counter: FpsCounter }) {
  const fps = useStore(counter, (fps) => fps);
  return <span className="text-xs text-white/60 tabular-nums">{fps} fps</span>;
}
