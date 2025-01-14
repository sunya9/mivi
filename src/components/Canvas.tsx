import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  onRedraw: () => void;
  onClick?: () => void;
}

export const Canvas = ({
  onRedraw,
  onInit,
  onClick,
  className,
  aspectRatio,
  ...props
}: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { width = 0 } = useResizeDetector({
    onResize: () => setTimeout(() => onRedraw(), 0), // workaround
    targetRef: containerRef,
  });

  const calculatedHeight = width * aspectRatio;
  const canvasWidth = width * window.devicePixelRatio;
  const canvasHeight = calculatedHeight * window.devicePixelRatio;

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInit(ctx);
  }, [onInit]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#f0f0f0]">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-[linear-gradient(45deg,#ddd_25%,transparent_25%,transparent_75%,#ddd_75%,#ddd),linear-gradient(45deg,#ddd_25%,transparent_25%,transparent_75%,#ddd_75%,#ddd)]",
          "bg-[position:0_0,8px_8px]",
          "bg-[size:16px_16px]",
        )}
      >
        <canvas
          ref={ref}
          className={cn(className, "h-auto w-full", "object-contain")}
          style={{
            aspectRatio: `${1 / aspectRatio}`,
            maxHeight: "100%",
          }}
          width={canvasWidth}
          height={canvasHeight}
          onClick={onClick}
          {...props}
        />
      </div>
    </div>
  );
};
