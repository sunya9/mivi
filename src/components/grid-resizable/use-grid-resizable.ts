import {
  useState,
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GridResizableContextValue } from "./grid-resizable-context";
import type {
  PanelConfig,
  PanelSize,
  PanelSizeUnit,
  LayoutState,
  Orientation,
} from "./types";

/** Resize state during drag (position-based) */
interface ResizeState {
  active: boolean;
  separatorId: string;
  orientation: Orientation;
  controls: [string, string];
  rangeStart: number;
  rangeEnd: number;
  controlledFrSum: number;
  /** Unit type of before panel */
  beforeUnit: PanelSizeUnit;
  /** Unit type of after panel */
  afterUnit: PanelSizeUnit;
}

const STORAGE_KEY_PREFIX = "grid-resizable:v2:";
const DEFAULT_KEYBOARD_STEP = 50;
const LARGE_KEYBOARD_STEP = 100;
const DEFAULT_KEYBOARD_STEP_PX = 20;
const LARGE_KEYBOARD_STEP_PX = 50;

interface UseGridResizableOptions {
  id: string;
  panels: PanelConfig[];
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

    const unit = config.sizeUnit ?? "fr";
    // Default min size depends on unit type (fr uses large integers like 1000)
    const defaultMinSize = unit === "px" ? 100 : 100;
    const { minSize = defaultMinSize, maxSize = Infinity } =
      config.constraints ?? {};
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
    const defaultSizes = Object.fromEntries(
      panels.map((p) => [p.id, p.defaultSize]),
    );
    // Use stored sizes if available and non-empty, otherwise use defaults
    if (storedLayout?.sizes && Object.keys(storedLayout.sizes).length > 0) {
      return storedLayout.sizes;
    }
    return defaultSizes;
  });

  // Ref to track latest sizes synchronously for endResize callback
  // useRef only uses the argument on first render
  const sizesRef = useRef(sizes);

  const setSizes = useCallback(
    (newSizes: Record<string, PanelSize>) => {
      const constrained = applyConstraints(newSizes, panelConfigs);
      sizesRef.current = constrained;
      setSizesInternal(constrained);
    },
    [panelConfigs],
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

      // Get unit types for both panels
      const beforeConfig = panelConfigs.get(beforeId);
      const afterConfig = panelConfigs.get(afterId);
      const beforeUnit = beforeConfig?.sizeUnit ?? "fr";
      const afterUnit = afterConfig?.sizeUnit ?? "fr";

      resizeStateRef.current = {
        active: true,
        separatorId,
        orientation,
        controls,
        rangeStart: start,
        rangeEnd: end,
        controlledFrSum,
        beforeUnit,
        afterUnit,
      };
    },
    [sizes, panelConfigs],
  );

  const updateResize = useCallback(
    (currentPosition: number) => {
      const state = resizeStateRef.current;
      if (!state?.active) return;

      const {
        controls,
        rangeStart,
        rangeEnd,
        controlledFrSum,
        beforeUnit,
        afterUnit,
      } = state;
      const [beforeId, afterId] = controls;

      // Calculate ratio based on mouse position within the range
      const rangeSize = rangeEnd - rangeStart;
      if (rangeSize <= 0) return;

      const mouseOffset = currentPosition - rangeStart;

      // Handle px + fr combination (e.g., visualizer[px] + config[fr])
      if (beforeUnit === "px" && afterUnit === "fr") {
        // Set before panel to exact pixel value, after panel auto-fills
        const newBeforeSize = Math.max(100, mouseOffset);
        setSizes({
          ...sizes,
          [beforeId]: newBeforeSize,
          // afterId keeps its fr value - CSS grid auto-fills remaining space
        });
        return;
      }

      // Handle fr + px combination (reverse case)
      if (beforeUnit === "fr" && afterUnit === "px") {
        // Set after panel to exact pixel value
        const newAfterSize = Math.max(100, rangeSize - mouseOffset);
        setSizes({
          ...sizes,
          [afterId]: newAfterSize,
          // beforeId keeps its fr value - CSS grid auto-fills remaining space
        });
        return;
      }

      // Standard fr + fr case
      const ratio = Math.max(0.05, Math.min(0.95, mouseOffset / rangeSize));

      // Calculate new fr values based on ratio (round to integers to avoid floating point errors)
      const newBeforeSize = Math.round(controlledFrSum * ratio);
      const newAfterSize = controlledFrSum - newBeforeSize;

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
      persistLayout(sizesRef.current);
    }
    resizeStateRef.current = null;
  }, [persistLayout]);

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

      // Get unit types
      const beforeConfig = panelConfigs.get(beforeId);
      const afterConfig = panelConfigs.get(afterId);
      const beforeUnit = beforeConfig?.sizeUnit ?? "fr";
      const afterUnit = afterConfig?.sizeUnit ?? "fr";

      // Handle px + fr combination
      if (beforeUnit === "px" && afterUnit === "fr") {
        const pxStep =
          step === DEFAULT_KEYBOARD_STEP
            ? DEFAULT_KEYBOARD_STEP_PX
            : LARGE_KEYBOARD_STEP_PX;
        const newBeforeSize = beforeSize + pxStep * direction;
        if (newBeforeSize <= 100) return;
        setSizes({ ...sizes, [beforeId]: newBeforeSize });
        persistLayout(sizesRef.current);
        return;
      }

      // Handle fr + px combination
      if (beforeUnit === "fr" && afterUnit === "px") {
        const pxStep =
          step === DEFAULT_KEYBOARD_STEP
            ? DEFAULT_KEYBOARD_STEP_PX
            : LARGE_KEYBOARD_STEP_PX;
        // Direction is reversed for after panel
        const newAfterSize = afterSize - pxStep * direction;
        if (newAfterSize <= 100) return;
        setSizes({ ...sizes, [afterId]: newAfterSize });
        persistLayout(sizesRef.current);
        return;
      }

      // Standard fr + fr case
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
      persistLayout(sizesRef.current);
    },
    [sizes, panelConfigs, setSizes, persistLayout],
  );

  const resizeToMin = useCallback(
    (controls: [string, string], shrinkPanelId: string) => {
      const [beforeId, afterId] = controls;
      const beforeSize = sizes[beforeId];
      const afterSize = sizes[afterId];

      if (beforeSize === undefined || afterSize === undefined) return;

      const shrinkPanel = panelConfigs.get(shrinkPanelId);
      const shrinkUnit = shrinkPanel?.sizeUnit ?? "fr";
      // Default min size (fr uses large integers like 1000)
      const defaultMinSize = shrinkUnit === "px" ? 100 : 100;
      const minSize = shrinkPanel?.constraints?.minSize ?? defaultMinSize;

      // For px panels, just set to min - the fr panel auto-fills
      if (shrinkUnit === "px") {
        setSizes({ ...sizes, [shrinkPanelId]: minSize });
        persistLayout(sizesRef.current);
        return;
      }

      // For fr panels, redistribute the total
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
      persistLayout(sizesRef.current);
    },
    [sizes, panelConfigs, setSizes, persistLayout],
  );

  const resizeToFit = useCallback(
    (
      separatorId: string,
      orientation: Orientation,
      controls: [string, string],
      targetPanelId: string,
      getOptimalSize: () => number | null,
    ) => {
      const container = containerRef.current;
      if (!container) return;

      const [beforeId, afterId] = controls;
      const beforeSize = sizes[beforeId];
      const afterSize = sizes[afterId];

      if (beforeSize === undefined || afterSize === undefined) return;

      // Get optimal size from callback
      const optimalPixelSize = getOptimalSize();
      if (optimalPixelSize === null) return;

      // Check if target panel is px-based
      const targetConfig = panelConfigs.get(targetPanelId);
      const targetUnit = targetConfig?.sizeUnit ?? "fr";

      // For px panels, directly set the pixel value
      if (targetUnit === "px") {
        setSizes({ ...sizes, [targetPanelId]: optimalPixelSize });
        persistLayout(sizesRef.current);
        return;
      }

      // For fr panels, use ratio calculation
      // Use getResizableRange to get the total pixel range
      // This handles virtual panels (panels without DOM elements)
      const { start, end } = getResizableRange(
        container,
        separatorId,
        orientation,
        controls,
      );
      const totalPixels = end - start;

      if (totalPixels <= 0) return;

      // Calculate new fr values based on optimal size ratio
      const totalFr = beforeSize + afterSize;
      const isTargetBefore = targetPanelId === beforeId;

      const optimalRatio = Math.max(
        0.05,
        Math.min(0.95, optimalPixelSize / totalPixels),
      );

      // Round to integers to avoid floating point errors
      const targetFr = Math.round(totalFr * optimalRatio);
      const otherFr = totalFr - targetFr;

      let newSizes: Record<string, PanelSize>;
      if (isTargetBefore) {
        newSizes = {
          ...sizes,
          [beforeId]: targetFr,
          [afterId]: otherFr,
        };
      } else {
        newSizes = {
          ...sizes,
          [beforeId]: otherFr,
          [afterId]: targetFr,
        };
      }

      setSizes(newSizes);
      persistLayout(sizesRef.current);
    },
    [sizes, panelConfigs, setSizes, persistLayout],
  );

  const panelStyles = useMemo<CSSProperties>(() => {
    const vars: Record<string, string> = {};
    for (const [panelId, size] of Object.entries(sizes)) {
      const config = panelConfigs.get(panelId);
      const unit = config?.sizeUnit ?? "fr";
      vars[`--panel-${panelId}`] = `${size}${unit}`;
    }
    return vars;
  }, [sizes, panelConfigs]);

  const contextValue = useMemo<GridResizableContextValue>(
    () => ({
      sizes,
      panelConfigs,
      startResize,
      updateResize,
      endResize,
      resizeByKeyboard,
      resizeToMin,
      resizeToFit,
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
      resizeToFit,
      getContainerRef,
    ],
  );

  return { containerRef, panelStyles, contextValue };
}

export { DEFAULT_KEYBOARD_STEP, LARGE_KEYBOARD_STEP };
