import type { ReactNode } from "react";

/** Panel size unit (fr ratio) */
export type PanelSize = number;

/** Panel orientation */
export type Orientation = "horizontal" | "vertical";

/** Panel size constraints */
export interface PanelConstraints {
  /** Minimum fr value (e.g., 0.2) */
  minSize?: PanelSize;
  /** Maximum fr value (e.g., 3) */
  maxSize?: PanelSize;
}

/** Individual panel configuration */
export interface PanelConfig {
  id: string;
  defaultSize: PanelSize;
  constraints?: PanelConstraints;
}

/** Layout state (for persistence) */
export interface LayoutState {
  sizes: Record<string, PanelSize>;
}

/** Grid area definition */
export interface GridAreaConfig {
  /** grid-template-areas string */
  areas: string;
  /** grid-template-columns */
  columns?: string;
  /** grid-template-rows */
  rows?: string;
}

/** PanelGroup Props */
export interface GridResizablePanelGroupProps {
  /** Unique identifier (used as persistence key) */
  id: string;
  /** Array of panel configurations */
  panels: PanelConfig[];
  /** Grid area configuration */
  gridArea?: GridAreaConfig;
  /** Grid area configuration for mobile */
  mobileGridArea?: GridAreaConfig;
  /** Whether in mobile mode */
  isMobile?: boolean;
  /** Callback when layout changes */
  onLayoutChange?: (state: LayoutState) => void;
  /** Child elements */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/** Panel Props */
export interface GridResizablePanelProps {
  /** Panel ID (defined in PanelGroup's panels array) */
  id: string;
  /** grid-area name */
  area?: string;
  /** Child elements */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/** Separator Props */
export interface GridResizableSeparatorProps {
  /** Separator ID */
  id: string;
  /** Control orientation */
  orientation: Orientation;
  /** Panel IDs to control [before, after] */
  controls: [string, string];
  /** grid-area name */
  area?: string;
  /** Additional class name */
  className?: string;
}

/** Resize state during drag (position-based) */
export interface ResizeState {
  active: boolean;
  separatorId: string;
  orientation: Orientation;
  controls: [string, string];
  /** Start of resizable range in pixels */
  rangeStart: number;
  /** End of resizable range in pixels */
  rangeEnd: number;
  /** Sum of fr values for the two panels being resized */
  controlledFrSum: number;
}

/** Context value */
export interface GridResizableContextValue {
  sizes: Record<string, PanelSize>;
  panelConfigs: Map<string, PanelConfig>;
  isMobile: boolean;
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
