import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";
import { RendererCreator } from "@/lib/RendererCreator";
import { AudioHandler } from "@/lib/AudioHandler";
import { Renderer } from "@/types/renderer";
import Canvas from "@/components/Canvas";
import { useResizeDetector } from "react-resize-detector";
import { MidiState } from "@/types/midi";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Props {
  midiState: MidiState;
  rendererCreator: RendererCreator;
  audioHandler?: AudioHandler;
}

export const MidiVisualizer = ({
  midiState,
  rendererCreator,
  audioHandler,
}: Props) => {
  const animationFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const [renderer, setRenderer] = useState<Renderer>();
  const [currentTime, setCurrentTime] = useState(
    audioHandler?.getCurrentTime || 0,
  );

  const onCanvasInit = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      setRenderer(rendererCreator.create(ctx));
    },
    [rendererCreator],
  );
  const duration = useMemo(
    () => audioHandler?.getDuration || 0,
    [audioHandler],
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!renderer || !audioHandler) return;

      lastFrameTimeRef.current = timestamp;

      setCurrentTime(audioHandler.getCurrentTime);
      renderer.render(midiState.tracks, audioHandler.currentStatus);

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [renderer, audioHandler, midiState.tracks],
  );

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  useResizeDetector({
    onResize: () => {
      if (!renderer || !audioHandler) return;
      renderer.render(midiState.tracks, audioHandler.currentStatus);
    },
  });
  useEffect(() => {
    if (!renderer || !audioHandler) return;
    renderer.render(midiState.tracks, audioHandler.currentStatus);
    console.log("render");
  }, [renderer, audioHandler, midiState.tracks]);

  return (
    <div className="relative h-full w-full">
      <Canvas onInit={onCanvasInit} className="h-full w-full" />
      {audioHandler && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => audioHandler.toggle()}
              variant="ghost"
              className="text-background"
            >
              {audioHandler.isPlaying ? <Pause /> : <Play />}
            </Button>
            <span className="min-w-[80px] text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <Slider
              max={duration}
              value={[currentTime]}
              step={1}
              onValueChange={([e]) => audioHandler.seek(e)}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};
