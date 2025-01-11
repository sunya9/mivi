import { formatTime, getRendererFromConfig } from "@/lib/utils";
import { AudioHandler } from "@/lib/AudioHandler";
import { Canvas } from "@/components/Canvas";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useEffect, useMemo, useState } from "react";
import { MidiState } from "@/types/midi";
import { useMidiVisualizer } from "@/lib/useMidiVisualizer";
import { RendererConfig } from "@/types/renderer";

interface Props {
  audioHandler?: AudioHandler;
  midiState?: MidiState;
  rendererConfig: RendererConfig;
}

export const MidiVisualizer = ({
  audioHandler,
  midiState,
  rendererConfig,
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
            variant="ghost"
            className="text-background"
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <span className="min-w-[80px] text-white">
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
