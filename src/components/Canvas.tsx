import { cn } from "@/lib/utils";
import { CanvasHTMLAttributes, useEffect } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  onInit: (ctx: CanvasRenderingContext2D) => void;
}

const Canvas = ({ onInit, className, ...props }: Props) => {
  // const { ref, width, height } = useResizeObserver<HTMLCanvasElement>();
  const { ref, width = 0 } = useResizeDetector<HTMLCanvasElement>();
  // if (ref.current) {
  //   ref.current.width = width;
  //   ref.current.height = (height * 9) / 16;
  // }
  const calculatedHight = (width * 9) / 16;

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    onInit(ctx);
    // if (ref.current) {
    //   ref.current.width = width;
    //   ref.current.height = (width * 9) / 16;
    // }
  }, [onInit, ref]);
  return (
    <canvas
      ref={ref}
      {...props}
      className={cn(className, "")}
      width={width}
      height={calculatedHight}
    />
  );
};

export default Canvas;
