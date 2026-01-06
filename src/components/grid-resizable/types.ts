/** Panel size unit (fr ratio) */
export type PanelSize = number;

/** Panel orientation */
export type Orientation = "horizontal" | "vertical";

/** Individual panel configuration */
export interface PanelConfig {
  id: string;
  defaultSize: PanelSize;
  constraints?: {
    minSize?: PanelSize;
    maxSize?: PanelSize;
  };
}

/** Layout state (for persistence) */
export interface LayoutState {
  sizes: Record<string, PanelSize>;
}
