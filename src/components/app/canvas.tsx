import { cn } from "@/lib/utils";
import {
  CanvasHTMLAttributes,
  useEffectEvent,
  useLayoutEffect,
  useRef,
} from "react";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  invalidate: () => void;
}

export function Canvas({
  onInit,
  className,
  aspectRatio,
  style,
  invalidate,
  ...props
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onInvalidate = useEffectEvent(invalidate);
  const onInitEffect = useEffectEvent(onInit);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInitEffect(ctx);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = container.clientWidth;
      if (!width) return;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = (width / aspectRatio) * window.devicePixelRatio;
      onInvalidate();
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    resizeCanvas();

    return () => observer.disconnect();
  }, [aspectRatio]);

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
          aspectRatio,
        }}
        {...props}
      />
    </div>
  );
}
