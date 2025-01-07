import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  onInit: (ctx: CanvasRenderingContext2D) => void;
  onRedraw: () => void;
}

const Canvas = ({ onRedraw, onInit, className, ...props }: Props) => {
  const dpr = window.devicePixelRatio;
  const ref = useRef<HTMLCanvasElement>(null);
  const { width = 0 } = useResizeDetector<HTMLCanvasElement>({
    onResize: onRedraw,
    targetRef: ref,
  });
  const calculatedWidth = width * dpr;
  const calculatedHight = (calculatedWidth * 9) / 16;

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

export default Canvas;
