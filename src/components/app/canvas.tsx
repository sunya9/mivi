import { cn } from "@/lib/utils";
import {
  CanvasHTMLAttributes,
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { OnResizeCallback, useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  invalidate: () => void;
  onClickCanvas: (pointerType: string) => void;
}

export function Canvas({
  onInit,
  onClickCanvas,
  className,
  aspectRatio,
  style,
  invalidate,
  ...props
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onResize: OnResizeCallback = useCallback(
    ({ width }) => {
      if (!canvasRef.current) return;
      if (!width) return;
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = width * aspectRatio * window.devicePixelRatio;
      invalidate();
    },
    [aspectRatio, invalidate],
  );

  const { ref: containerRef } = useResizeDetector<HTMLDivElement>({
    onResize,
  });

  const onInitEffect = useEffectEvent(onInit);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInitEffect(ctx);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full",
        "flex items-center justify-center",
        "bg-gray-50 dark:bg-gray-600",
        "bg-[linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas)),linear-gradient(45deg,var(--canvas)_25%,transparent_25%,transparent_75%,var(--canvas)_75%,var(--canvas))]",
        "bg-position-[0_0,8px_8px]",
        "bg-size-[16px_16px]",
        "[view-transition-name:canvas-wrapper]",
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn("h-auto max-h-full w-full object-contain", className)}
        aria-label="Visualized Midi"
        style={{
          ...style,
          aspectRatio: `${1 / aspectRatio}`,
        }}
        onPointerUp={(e) => e.button === 0 && onClickCanvas(e.pointerType)}
        {...props}
      />
    </div>
  );
}
