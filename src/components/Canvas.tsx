import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  aspectRatio: number;
  onInit: (ctx: CanvasRenderingContext2D) => void;
  onRedraw: () => void;
}

export const Canvas = ({
  onRedraw,
  onInit,
  className,
  aspectRatio,
  ...props
}: Props) => {
  const dpr = window.devicePixelRatio;
  const ref = useRef<HTMLCanvasElement>(null);
  const { width = 0 } = useResizeDetector<HTMLCanvasElement>({
    onResize: onRedraw,
    targetRef: ref,
  });
  const calculatedWidth = width * dpr;
  const calculatedHight = calculatedWidth * aspectRatio;

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    onInit(ctx);
  }, [onInit, ref]);
  return (
    <canvas
      ref={ref}
      className={cn(className, "h-full w-full")}
      width={calculatedWidth}
      height={calculatedHight}
      {...props}
    />
  );
};
