/** Panel size value (numeric) */
export type PanelSize = number;

/** Panel size unit */
export type PanelSizeUnit = "fr" | "px";

/** Panel orientation */
export type Orientation = "horizontal" | "vertical";

/** Individual panel configuration */
export interface PanelConfig {
  id: string;
  defaultSize: PanelSize;
  /** Size unit: 'fr' (relative) or 'px' (absolute). Default: 'fr' */
  sizeUnit?: PanelSizeUnit;
  constraints?: {
    minSize?: PanelSize;
    maxSize?: PanelSize;
  };
  /** For px panels with aspect ratio: callback to get optimal size based on current dimensions */
  getOptimalSize?: () => number | null;
}

/** Layout state (for persistence) */
export interface LayoutState {
  sizes: Record<string, PanelSize>;
}
