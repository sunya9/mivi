import { createContext, useContext } from "react";
import type { Orientation, PanelConfig, PanelSize } from "./types";

/** Context value */
export interface GridResizableContextValue {
  sizes: Record<string, PanelSize>;
  panelConfigs: Map<string, PanelConfig>;
  startResize: (
    separatorId: string,
    orientation: Orientation,
    controls: [string, string],
  ) => void;
  updateResize: (currentPosition: number) => void;
  endResize: () => void;
  resizeByKeyboard: (
    orientation: Orientation,
    controls: [string, string],
    direction: 1 | -1,
    step?: number,
  ) => void;
  getContainerRef: () => HTMLDivElement | null;
}

export const GridResizableContext =
  createContext<GridResizableContextValue | null>(null);

export function useGridResizableContext(): GridResizableContextValue {
  const context = useContext(GridResizableContext);
  if (!context) {
    throw new Error(
      "useGridResizableContext must be used within GridResizablePanelGroup",
    );
  }
  return context;
}
