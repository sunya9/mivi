import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useCallback, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  onRedraw: () => void;
  onClickCanvas: (pointerType: string) => void;
}

export function Canvas({
  onRedraw,
  onInit,
  onClickCanvas,
  className,
  aspectRatio,
  style,
  ...props
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  const onResize = useCallback(() => {
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    const calculatedHeight = width * aspectRatio;
    const canvasWidth = width * window.devicePixelRatio;
    const canvasHeight = calculatedHeight * window.devicePixelRatio;
    ref.current.width = canvasWidth;
    ref.current.height = canvasHeight;
    onRedraw();
  }, [aspectRatio, onRedraw]);
  useResizeDetector({
    onResize,
    targetRef: ref,
  });

  const callbackRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      ref.current = canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");
      onInit(ctx);
    },
    [onInit],
  );
  return (
    <div
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
        ref={callbackRef}
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
