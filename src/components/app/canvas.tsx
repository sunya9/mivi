import { cn } from "cn";
import { useLayoutEffect, useRef } from "react";

import { useAppContext } from "@/contexts/app-context";
import { useMessages } from "@/lib/locale/use-messages";

interface Props {
  className?: string;
}

export function Canvas({ className }: Props) {
  const m = useMessages();
  const { visualizerEngine } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasLabel = m.player_canvas_label();

  useLayoutEffect(() => {
    visualizerEngine.canvas.setAttribute("aria-label", canvasLabel);
  }, [visualizerEngine, canvasLabel]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const unmount = visualizerEngine.mountCanvas(container);
    const fit = () => visualizerEngine.fitCanvas(container.clientWidth, container.clientHeight);
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    fit();
    return () => {
      unmount();
      observer.disconnect();
    };
  }, [visualizerEngine]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", "flex items-center justify-center", className)}
    />
  );
}
