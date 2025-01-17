import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useCallback, useEffect, useRef } from "react";
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

  const render = useCallback(() => {
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
    onResize: render,
    targetRef: ref,
  });

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInit(ctx);
  }, [onInit]);
  return (
    <div
      className={cn(
        "h-full w-full bg-gray-50",
        "flex items-center justify-center",
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
        onClick={onClick}
        {...props}
      />
    </div>
  );
};
