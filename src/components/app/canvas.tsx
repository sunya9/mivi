import { cn } from "@/lib/utils";
import {
  CanvasHTMLAttributes,
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { useResizeDetector } from "react-resize-detector";

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
  const ref = useRef<HTMLCanvasElement>(null);

  const resizeCanvas = useCallback(() => {
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    const calculatedHeight = width * aspectRatio;
    const canvasWidth = width * window.devicePixelRatio;
    const canvasHeight = calculatedHeight * window.devicePixelRatio;
    ref.current.width = canvasWidth;
    ref.current.height = canvasHeight;
  }, [aspectRatio]);
  const resizeCanvasEffect = useEffectEvent(resizeCanvas);

  const onResize = useCallback(() => {
    resizeCanvas();
    invalidate();
  }, [resizeCanvas, invalidate]);
  useResizeDetector({
    onResize,
    targetRef: ref,
  });

  const onInitEffectEvent = useEffectEvent(onInit);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInitEffectEvent(ctx);
  }, []);

  useLayoutEffect(() => {
    resizeCanvasEffect();
  }, []);
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
        ref={ref}
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
