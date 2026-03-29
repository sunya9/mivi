import { useCallback, useRef } from "react";

interface Resolution {
  width: number;
  height: number;
}

interface UseVisualizerFitReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  getVisualizerOptimalHeight: () => number | undefined;
  getCenterFitSize: (sidePanel: string, sizes: Record<string, number>) => number | undefined;
}

/**
 * Provides double-click-to-fit callbacks for the grid layout.
 * - getVisualizerOptimalHeight: fits visualizer height to aspect ratio
 * - getCenterFitSize: inverse-calculates side panel size to fit center to canvas width
 */
export function useVisualizerFit(resolution: Resolution): UseVisualizerFitReturn {
  const containerRef = useRef<HTMLDivElement>(null);

  const getVisualizerOptimalHeight = useCallback((): number | undefined => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    return rect.width * (resolution.height / resolution.width);
  }, [resolution]);

  // Inverse-calculate side panel size to fit center column to canvas content width.
  // new_side_panel = current_side_panel + (current_center - desired_center)
  const getCenterFitSize = useCallback(
    (sidePanel: string, sizes: Record<string, number>): number | undefined => {
      const container = containerRef.current;
      if (!container) return;

      const currentCenterWidth = container.getBoundingClientRect().width;
      const visualizerHeight = sizes["visualizer"];
      if (!visualizerHeight) return;

      const desiredCenterWidth = visualizerHeight * (resolution.width / resolution.height);

      const currentSize = sizes[sidePanel];
      if (!currentSize) return;
      return currentSize + (currentCenterWidth - desiredCenterWidth);
    },
    [resolution],
  );

  return { containerRef, getVisualizerOptimalHeight, getCenterFitSize };
}
