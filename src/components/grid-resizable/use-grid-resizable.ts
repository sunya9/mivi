import {
  useState,
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GridResizableContextValue } from "./grid-resizable-context";
import type { PanelConfig, PanelSize, LayoutState, Orientation } from "./types";

/** Resize state during drag (position-based) */
interface ResizeState {
  active: boolean;
  separatorId: string;
  orientation: Orientation;
  controls: [string, string];
  rangeStart: number;
  rangeEnd: number;
  controlledFrSum: number;
}

const STORAGE_KEY_PREFIX = "grid-resizable:";
const DEFAULT_KEYBOARD_STEP = 0.05;
const LARGE_KEYBOARD_STEP = 0.1;

interface UseGridResizableOptions {
  id: string;
  panels: PanelConfig[];
  onLayoutChange?: (state: LayoutState) => void;
}

interface UseGridResizableReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  panelStyles: CSSProperties;
  contextValue: GridResizableContextValue;
}

function applyConstraints(
  sizes: Record<string, PanelSize>,
  panelConfigs: Map<string, PanelConfig>,
): Record<string, PanelSize> {
  const result = { ...sizes };

  for (const [id, config] of panelConfigs) {
    const size = result[id];
    if (size === undefined) continue;

    const { minSize = 0.1, maxSize = Infinity } = config.constraints ?? {};
    result[id] = Math.max(minSize, Math.min(maxSize, size));
  }

  return result;
}

/**
 * Calculate the resizable range for a separator.
 * The range is the pixel boundaries within which the separator can move.
 */
function getResizableRange(
  container: HTMLElement,
  separatorId: string,
  orientation: Orientation,
  controls: [string, string],
): { start: number; end: number } {
  const containerRect = container.getBoundingClientRect();
  const [beforeId, afterId] = controls;

  // Get the current separator element to exclude it from searches
  const currentSeparator = container.querySelector(
    `[data-separator-id="${separatorId}"]`,
  );

  if (orientation === "horizontal") {
    // Find the left edge of the before panel
    const beforePanel = container.querySelector(
      `[data-panel-id="${beforeId}"]`,
    );
    let start = beforePanel
      ? beforePanel.getBoundingClientRect().left
      : containerRect.left;

    // Find the right edge of the after panel
    const afterPanel = container.querySelector(`[data-panel-id="${afterId}"]`);
    let end = afterPanel
      ? afterPanel.getBoundingClientRect().right
      : containerRect.right;

    // Handle virtual panels (no DOM element) by finding adjacent separators
    // Only consider separators with the same orientation
    if (!beforePanel) {
      const separators = container.querySelectorAll(
        `[data-slot='grid-resizable-separator'][data-orientation='${orientation}']`,
      );
      for (const sep of separators) {
        if (sep === currentSeparator) continue;
        const sepRect = sep.getBoundingClientRect();
        if (sepRect.right < end && sepRect.right > start) {
          start = sepRect.right;
        }
      }
    }

    if (!afterPanel) {
      const separators = container.querySelectorAll(
        `[data-slot='grid-resizable-separator'][data-orientation='${orientation}']`,
      );
      for (const sep of separators) {
        if (sep === currentSeparator) continue;
        const sepRect = sep.getBoundingClientRect();
        if (sepRect.left > start && sepRect.left < end) {
          end = sepRect.left;
        }
      }
    }

    return { start, end };
  } else {
    // Vertical orientation - use top/bottom
    const beforePanel = container.querySelector(
      `[data-panel-id="${beforeId}"]`,
    );
    let start = beforePanel
      ? beforePanel.getBoundingClientRect().top
      : containerRect.top;

    const afterPanel = container.querySelector(`[data-panel-id="${afterId}"]`);
    let end = afterPanel
      ? afterPanel.getBoundingClientRect().bottom
      : containerRect.bottom;

    // Handle virtual panels - only consider separators with the same orientation
    if (!beforePanel) {
      const separators = container.querySelectorAll(
        `[data-slot='grid-resizable-separator'][data-orientation='${orientation}']`,
      );
      for (const sep of separators) {
        if (sep === currentSeparator) continue;
        const sepRect = sep.getBoundingClientRect();
        if (sepRect.bottom < end && sepRect.bottom > start) {
          start = sepRect.bottom;
        }
      }
    }

    if (!afterPanel) {
      const separators = container.querySelectorAll(
        `[data-slot='grid-resizable-separator'][data-orientation='${orientation}']`,
      );
      for (const sep of separators) {
        if (sep === currentSeparator) continue;
        const sepRect = sep.getBoundingClientRect();
        if (sepRect.top > start && sepRect.top < end) {
          end = sepRect.top;
        }
      }
    }

    return { start, end };
  }
}

export function useGridResizable({
  id,
  panels,
  onLayoutChange,
}: UseGridResizableOptions): UseGridResizableReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  const [storedLayout, setStoredLayout] = useLocalStorage<LayoutState>(
    STORAGE_KEY_PREFIX + id,
  );

  const panelConfigs = useMemo(() => {
    return new Map(panels.map((p) => [p.id, p]));
  }, [panels]);

  const [sizes, setSizesInternal] = useState<Record<string, PanelSize>>(() => {
    if (storedLayout) {
      return storedLayout.sizes;
    }
    return Object.fromEntries(panels.map((p) => [p.id, p.defaultSize]));
  });

  const setSizes = useCallback(
    (newSizes: Record<string, PanelSize>) => {
      const constrained = applyConstraints(newSizes, panelConfigs);
      setSizesInternal(constrained);
      onLayoutChange?.({ sizes: constrained });
    },
    [panelConfigs, onLayoutChange],
  );

  const persistLayout = useCallback(
    (sizesToSave: Record<string, PanelSize>) => {
      setStoredLayout({ sizes: sizesToSave });
    },
    [setStoredLayout],
  );

  const getContainerRef = useCallback(() => containerRef.current, []);

  const startResize = useCallback(
    (
      separatorId: string,
      orientation: Orientation,
      controls: [string, string],
    ) => {
      const container = containerRef.current;
      if (!container) return;

      const [beforeId, afterId] = controls;

      // Calculate the resizable range
      const { start, end } = getResizableRange(
        container,
        separatorId,
        orientation,
        controls,
      );

      // Calculate the sum of fr values for the controlled panels
      const beforeSize = sizes[beforeId] ?? 0;
      const afterSize = sizes[afterId] ?? 0;
      const controlledFrSum = beforeSize + afterSize;

      resizeStateRef.current = {
        active: true,
        separatorId,
        orientation,
        controls,
        rangeStart: start,
        rangeEnd: end,
        controlledFrSum,
      };
    },
    [sizes],
  );

  const updateResize = useCallback(
    (currentPosition: number) => {
      const state = resizeStateRef.current;
      if (!state?.active) return;

      const { controls, rangeStart, rangeEnd, controlledFrSum } = state;
      const [beforeId, afterId] = controls;

      // Calculate ratio based on mouse position within the range
      const rangeSize = rangeEnd - rangeStart;
      if (rangeSize <= 0) return;

      const mouseOffset = currentPosition - rangeStart;
      const ratio = Math.max(0.05, Math.min(0.95, mouseOffset / rangeSize));

      // Calculate new fr values based on ratio
      const newBeforeSize = controlledFrSum * ratio;
      const newAfterSize = controlledFrSum * (1 - ratio);

      setSizes({
        ...sizes,
        [beforeId]: newBeforeSize,
        [afterId]: newAfterSize,
      });
    },
    [sizes, setSizes],
  );

  const endResize = useCallback(() => {
    if (resizeStateRef.current?.active) {
      persistLayout(sizes);
    }
    resizeStateRef.current = null;
  }, [sizes, persistLayout]);

  const resizeByKeyboard = useCallback(
    (
      _orientation: Orientation,
      controls: [string, string],
      direction: 1 | -1,
      step: number = DEFAULT_KEYBOARD_STEP,
    ) => {
      const [beforeId, afterId] = controls;
      const beforeSize = sizes[beforeId];
      const afterSize = sizes[afterId];

      if (beforeSize === undefined || afterSize === undefined) return;

      const delta = step * direction;
      const newBeforeSize = beforeSize + delta;
      const newAfterSize = afterSize - delta;

      if (newBeforeSize <= 0 || newAfterSize <= 0) return;

      const newSizes = {
        ...sizes,
        [beforeId]: newBeforeSize,
        [afterId]: newAfterSize,
      };

      setSizes(newSizes);
      persistLayout(newSizes);
    },
    [sizes, setSizes, persistLayout],
  );

  const resizeToMin = useCallback(
    (controls: [string, string], shrinkPanelId: string) => {
      const [beforeId, afterId] = controls;
      const beforeSize = sizes[beforeId];
      const afterSize = sizes[afterId];

      if (beforeSize === undefined || afterSize === undefined) return;

      const shrinkPanel = panelConfigs.get(shrinkPanelId);
      const minSize = shrinkPanel?.constraints?.minSize ?? 0.1;
      const totalSize = beforeSize + afterSize;

      let newSizes: Record<string, PanelSize>;
      if (shrinkPanelId === beforeId) {
        // Shrink before panel to minimum, expand after panel
        const newBeforeSize = minSize;
        const newAfterSize = totalSize - minSize;
        newSizes = {
          ...sizes,
          [beforeId]: newBeforeSize,
          [afterId]: newAfterSize,
        };
      } else {
        // Shrink after panel to minimum, expand before panel
        const newAfterSize = minSize;
        const newBeforeSize = totalSize - minSize;
        newSizes = {
          ...sizes,
          [beforeId]: newBeforeSize,
          [afterId]: newAfterSize,
        };
      }

      setSizes(newSizes);
      persistLayout(newSizes);
    },
    [sizes, panelConfigs, setSizes, persistLayout],
  );

  const panelStyles = useMemo<CSSProperties>(() => {
    const vars: Record<string, string> = {};
    for (const [panelId, size] of Object.entries(sizes)) {
      vars[`--panel-${panelId}`] = `${size}fr`;
    }
    return vars;
  }, [sizes]);

  const contextValue = useMemo<GridResizableContextValue>(
    () => ({
      sizes,
      panelConfigs,
      startResize,
      updateResize,
      endResize,
      resizeByKeyboard,
      resizeToMin,
      getContainerRef,
    }),
    [
      sizes,
      panelConfigs,
      startResize,
      updateResize,
      endResize,
      resizeByKeyboard,
      resizeToMin,
      getContainerRef,
    ],
  );

  return { containerRef, panelStyles, contextValue };
}

export { DEFAULT_KEYBOARD_STEP, LARGE_KEYBOARD_STEP };
