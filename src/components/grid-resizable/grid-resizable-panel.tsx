import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { GridResizablePanelProps } from "./types";

export function GridResizablePanel({
  id,
  area,
  children,
  className,
}: GridResizablePanelProps) {
  const style: CSSProperties = {
    gridArea: area ?? id,
    minWidth: 0,
    minHeight: 0,
  };

  return (
    <div
      data-slot="grid-resizable-panel"
      data-panel-id={id}
      className={cn("overflow-hidden", className)}
      style={style}
    >
      {children}
    </div>
  );
}
