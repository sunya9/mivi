import { useLayoutEffect, useRef } from "react";

import { useAppContext } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Canvas({ className }: Props) {
  const { visualizerEngine } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);

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
