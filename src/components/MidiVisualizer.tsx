import { formatTime, getRendererFromConfig } from "@/lib/utils";
import { AudioHandler } from "@/lib/AudioHandler";
import { Canvas } from "@/components/Canvas";
import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useEffect, useMemo, useState } from "react";
import { MidiState } from "@/types/midi";
import { useMidiVisualizer } from "@/lib/useMidiVisualizer";
import { RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  audioHandler?: AudioHandler;
  midiState?: MidiState;
  rendererConfig: RendererConfig;
  onRendererConfigChange: (
    config: DeepPartial<RendererConfig>,
    storeConfig?: boolean,
  ) => void;
}

export const MidiVisualizer = ({
  audioHandler,
  midiState,
  rendererConfig,
  onRendererConfigChange,
}: Props) => {
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const renderer = useMemo(() => {
    return context ? getRendererFromConfig(context, rendererConfig) : undefined;
  }, [context, rendererConfig]);

  const {
    isPlaying,
    currentTime,
    duration,
    setIsPlaying,
    setCurrentTime,
    render,
    setVolume,
    setMuted,
  } = useMidiVisualizer(renderer, audioHandler, midiState);
  useEffect(() => {
    if (isPlaying) return;
    render();
  }, [render, isPlaying]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        aspectRatio={
          rendererConfig.resolution.height / rendererConfig.resolution.width
        }
        onRedraw={render}
        onInit={setContext}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="ghostSecondary"
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <div className="flex items-center gap-2">
            <HoverCard openDelay={100}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghostSecondary"
                  onClick={() => {
                    const newMuted = !rendererConfig.previewMuted;
                    setMuted(newMuted);
                    onRendererConfigChange({ previewMuted: newMuted });
                  }}
                >
                  {rendererConfig.previewMuted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-48">
                <Slider
                  value={[rendererConfig.previewVolume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => {
                    setVolume(value);
                    onRendererConfigChange({ previewVolume: value });
                  }}
                  onValueCommit={([value]) => {
                    setVolume(value);
                    onRendererConfigChange({ previewVolume: value }, true);
                  }}
                />
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className="min-w-28 text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Slider
            max={duration}
            value={[currentTime]}
            step={1}
            onValueChange={([e]) => setCurrentTime(e)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};
