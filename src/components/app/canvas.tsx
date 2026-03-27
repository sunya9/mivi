import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useEffectEvent, useLayoutEffect, useRef } from "react";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  invalidate: () => void;
}

function calcSize(container: HTMLElement, aspectRatio: number) {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  if (!containerWidth || !containerHeight) return;
  // Contain-fit: use the dimension that is more constrained
  const heightFromWidth = containerWidth / aspectRatio;
  if (heightFromWidth <= containerHeight) {
    return {
      width: containerWidth,
      height: heightFromWidth,
    };
  } else {
    return {
      height: containerHeight,
      width: containerHeight * aspectRatio,
    };
  }
}

export function Canvas({ onInit, className, aspectRatio, style, invalidate, ...props }: Props) {
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
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const size = calcSize(container, aspectRatio);
      if (!size) return;
      canvas.width = size.width * window.devicePixelRatio;
      canvas.height = size.height * window.devicePixelRatio;
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
      className={cn("h-full w-full", "flex items-center justify-center", className)}
    >
      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full [html:active-view-transition-type(canvas-expand)_&]:[view-transition-name:visualizer-canvas]"
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
