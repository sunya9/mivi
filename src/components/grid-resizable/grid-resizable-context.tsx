import { createContext, useContext } from "react";
import type { GridResizableContextValue } from "./types";

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
