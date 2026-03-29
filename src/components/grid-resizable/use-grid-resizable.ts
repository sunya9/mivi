import { useState, useRef, useCallback, useMemo, type CSSProperties } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GridResizableContextValue } from "./grid-resizable-context";
import type { PanelConfig, PanelSize, LayoutState, Orientation, SeparatorSide } from "./types";

/** Resize state during drag */
interface ResizeState {
  active: boolean;
  panelId: string;
  side: SeparatorSide;
  orientation: Orientation;
  /** Fixed edge of the panel (the edge that doesn't move during resize) */
  fixedEdge: number;
}

const STORAGE_KEY_PREFIX = "grid-resizable:v3:";
const DEFAULT_STEP = 20;
const LARGE_STEP = 50;
const DEFAULT_MIN_SIZE = 100;

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

    const { minSize = DEFAULT_MIN_SIZE, maxSize = Infinity } = config.constraints ?? {};
    result[id] = Math.max(minSize, Math.min(maxSize, size));
  }

  return result;
}

export function useGridResizable({ id, panels }: UseGridResizableOptions): UseGridResizableReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  const [storedLayout, setStoredLayout] = useLocalStorage<LayoutState>(STORAGE_KEY_PREFIX + id);

  const panelConfigs = useMemo(() => {
    return new Map(panels.map((p) => [p.id, p]));
  }, [panels]);

  const [sizes, setSizesInternal] = useState<Record<string, PanelSize>>(() => {
    const defaultSizes = Object.fromEntries(panels.map((p) => [p.id, p.defaultSize]));
    if (storedLayout?.sizes && Object.keys(storedLayout.sizes).length > 0) {
      return storedLayout.sizes;
    }
    return defaultSizes;
  });

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

  // Element registration maps
  const panelElements = useRef(new Map<string, HTMLElement>());
  const separatorElements = useRef(
    new Map<string, { element: HTMLElement; orientation: Orientation }>(),
  );

  const registerPanel = useCallback((panelId: string, element: HTMLElement) => {
    panelElements.current.set(panelId, element);
  }, []);

  const unregisterPanel = useCallback((panelId: string) => {
    panelElements.current.delete(panelId);
  }, []);

  const registerSeparator = useCallback(
    (separatorId: string, element: HTMLElement, orientation: Orientation) => {
      separatorElements.current.set(separatorId, { element, orientation });
    },
    [],
  );

  const unregisterSeparator = useCallback((separatorId: string) => {
    separatorElements.current.delete(separatorId);
  }, []);

  const startResize = useCallback(
    (panelId: string, side: SeparatorSide, orientation: Orientation) => {
      const panel = panelElements.current.get(panelId);
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      let fixedEdge: number;
      if (orientation === "horizontal") {
        fixedEdge = side === "before" ? rect.left : rect.right;
      } else {
        fixedEdge = side === "before" ? rect.top : rect.bottom;
      }

      resizeStateRef.current = {
        active: true,
        panelId,
        side,
        orientation,
        fixedEdge,
      };
    },
    [],
  );

  const updateResize = useCallback(
    (currentPosition: number) => {
      const state = resizeStateRef.current;
      if (!state?.active) return;

      const { panelId, side, fixedEdge } = state;

      const newSize = side === "before" ? currentPosition - fixedEdge : fixedEdge - currentPosition;

      setSizes({
        ...sizes,
        [panelId]: newSize,
      });
    },
    [sizes, setSizes],
  );

  // Clamp internal value to actual rendered size.
  // CSS Grid may render the panel smaller than the set value
  // (e.g., minmax(0, var(--panel-x)) shrinks when space is limited).
  const clampToRendered = useCallback((panelId: string, orientation: Orientation) => {
    const panel = panelElements.current.get(panelId);
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const actualSize = orientation === "horizontal" ? rect.width : rect.height;
    // Skip clamp if actualSize is 0 (e.g., panel not yet laid out or in test environments)
    if (actualSize === 0) return;
    const internalSize = sizesRef.current[panelId];
    if (internalSize !== undefined && actualSize < internalSize) {
      const corrected = { ...sizesRef.current, [panelId]: Math.round(actualSize) };
      sizesRef.current = corrected;
      setSizesInternal(corrected);
    }
  }, []);

  const endResize = useCallback(() => {
    const state = resizeStateRef.current;
    if (state?.active) {
      clampToRendered(state.panelId, state.orientation);
      persistLayout(sizesRef.current);
    }
    resizeStateRef.current = null;
  }, [clampToRendered, persistLayout]);

  const resizeByKeyboard = useCallback(
    (panelId: string, delta: number, orientation: Orientation) => {
      const currentSize = sizes[panelId];
      if (currentSize === undefined) return;

      setSizes({ ...sizes, [panelId]: currentSize + delta });
      persistLayout(sizesRef.current);
      // Clamp after CSS Grid layout recalculates
      requestAnimationFrame(() => {
        clampToRendered(panelId, orientation);
        persistLayout(sizesRef.current);
      });
    },
    [sizes, setSizes, clampToRendered, persistLayout],
  );

  const resizeToMin = useCallback(
    (panelId: string) => {
      if (sizes[panelId] === undefined) return;

      const config = panelConfigs.get(panelId);
      const minSize = config?.constraints?.minSize ?? DEFAULT_MIN_SIZE;

      setSizes({ ...sizes, [panelId]: minSize });
      persistLayout(sizesRef.current);
    },
    [sizes, panelConfigs, setSizes, persistLayout],
  );

  const resizeToFit = useCallback(
    (panelId: string, getOptimalSize: (sizes: Record<string, PanelSize>) => number | undefined) => {
      if (sizes[panelId] === undefined) return;

      const optimalSize = getOptimalSize(sizes);
      if (optimalSize === undefined) return;

      setSizes({ ...sizes, [panelId]: optimalSize });
      persistLayout(sizesRef.current);
    },
    [sizes, setSizes, persistLayout],
  );

  const panelStyles = useMemo<CSSProperties>(() => {
    const vars: Record<string, string> = {};
    for (const [panelId, size] of Object.entries(sizes)) {
      vars[`--panel-${panelId}`] = `${size}px`;
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
      resizeToFit,
      registerPanel,
      unregisterPanel,
      registerSeparator,
      unregisterSeparator,
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
      registerPanel,
      unregisterPanel,
      registerSeparator,
      unregisterSeparator,
    ],
  );

  return { containerRef, panelStyles, contextValue };
}

export { DEFAULT_STEP, LARGE_STEP };
