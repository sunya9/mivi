import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GridResizableContext } from "./grid-resizable-context";
import { useGridResizable } from "./use-grid-resizable";
import type { LayoutState, PanelConfig } from "./types";

interface GridResizablePanelGroupProps {
  id: string;
  panels: PanelConfig[];
  onLayoutChange?: (state: LayoutState) => void;
  children: ReactNode;
  className?: string;
}

export function GridResizablePanelGroup({
  id,
  panels,
  onLayoutChange,
  children,
  className,
}: GridResizablePanelGroupProps) {
  const { containerRef, panelStyles, contextValue } = useGridResizable({
    id,
    panels,
    onLayoutChange,
  });

  return (
    <GridResizableContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-slot="grid-resizable-panel-group"
        className={cn("h-full w-full", className)}
        style={panelStyles}
      >
        {children}
      </div>
    </GridResizableContext.Provider>
  );
}
