import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { GridResizableContext } from "./grid-resizable-context";
import { useGridResizable } from "./use-grid-resizable";
import type { GridResizablePanelGroupProps, GridAreaConfig } from "./types";

function generateGridStyles(
  sizes: Record<string, number>,
  gridArea?: GridAreaConfig,
): CSSProperties {
  const panelVars: Record<string, string> = {};

  for (const [id, size] of Object.entries(sizes)) {
    panelVars[`--panel-${id}`] = `${size}fr`;
  }

  return {
    display: "grid",
    gridTemplateAreas: gridArea?.areas,
    gridTemplateColumns: gridArea?.columns,
    gridTemplateRows: gridArea?.rows,
    ...panelVars,
  };
}

export function GridResizablePanelGroup({
  id,
  panels,
  gridArea,
  mobileGridArea,
  isMobile = false,
  onLayoutChange,
  children,
  className,
}: GridResizablePanelGroupProps) {
  const {
    sizes,
    panelConfigs,
    containerRef,
    startResize,
    updateResize,
    endResize,
    resizeByKeyboard,
    getContainerRef,
  } = useGridResizable({
    id,
    panels,
    onLayoutChange,
  });

  const effectiveGridArea = useMemo(() => {
    if (isMobile && mobileGridArea) {
      return mobileGridArea;
    }
    return gridArea;
  }, [isMobile, mobileGridArea, gridArea]);

  const gridStyles = useMemo(() => {
    return generateGridStyles(sizes, effectiveGridArea);
  }, [sizes, effectiveGridArea]);

  const contextValue = useMemo(
    () => ({
      sizes,
      panelConfigs,
      isMobile,
      startResize,
      updateResize,
      endResize,
      resizeByKeyboard,
      getContainerRef,
    }),
    [
      sizes,
      panelConfigs,
      isMobile,
      startResize,
      updateResize,
      endResize,
      resizeByKeyboard,
      getContainerRef,
    ],
  );

  return (
    <GridResizableContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-slot="grid-resizable-panel-group"
        className={cn("h-full w-full", className)}
        style={gridStyles}
      >
        {children}
      </div>
    </GridResizableContext.Provider>
  );
}
