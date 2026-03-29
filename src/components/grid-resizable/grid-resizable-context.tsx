import { createContext, useContext } from "react";
import type { Orientation, PanelConfig, PanelSize, SeparatorSide } from "./types";

/** Context value */
export interface GridResizableContextValue {
  sizes: Record<string, PanelSize>;
  panelConfigs: Map<string, PanelConfig>;
  startResize: (panelId: string, side: SeparatorSide, orientation: Orientation) => void;
  updateResize: (currentPosition: number) => void;
  endResize: () => void;
  resizeByKeyboard: (panelId: string, delta: number, orientation: Orientation) => void;
  resizeToMin: (panelId: string) => void;
  resizeToFit: (
    panelId: string,
    getOptimalSize: (sizes: Record<string, PanelSize>) => number | undefined,
  ) => void;
  registerPanel: (id: string, element: HTMLElement) => void;
  unregisterPanel: (id: string) => void;
  registerSeparator: (id: string, element: HTMLElement, orientation: Orientation) => void;
  unregisterSeparator: (id: string) => void;
}

export const GridResizableContext = createContext<GridResizableContextValue | null>(null);

export function useGridResizableContext(): GridResizableContextValue {
  const context = useContext(GridResizableContext);
  if (!context) {
    throw new Error("useGridResizableContext must be used within GridResizablePanelGroup");
  }
  return context;
}
