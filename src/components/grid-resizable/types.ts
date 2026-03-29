/** Panel size in pixels */
export type PanelSize = number;

/** Panel orientation */
export type Orientation = "horizontal" | "vertical";

/** Which side of the separator the controlled panel is on */
export type SeparatorSide = "before" | "after";

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
