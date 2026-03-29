import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useGridResizableContext } from "./grid-resizable-context";
import { LARGE_STEP } from "./use-grid-resizable";
import type { Orientation, PanelSize, SeparatorSide } from "./types";

interface GridResizableSeparatorProps {
  id: string;
  orientation: Orientation;
  /** The panel this separator resizes */
  panelId: string;
  /** Which side of the separator the panel is on */
  side: SeparatorSide;
  className?: string;
  /** Callback to get optimal size for the panel on double-click. Receives current sizes. */
  getOptimalSizeForFit?: (sizes: Record<string, PanelSize>) => number | undefined;
}

export function GridResizableSeparator({
  id,
  orientation,
  panelId,
  side,
  className,
  getOptimalSizeForFit,
}: GridResizableSeparatorProps) {
  const {
    sizes,
    startResize,
    updateResize,
    endResize,
    resizeByKeyboard,
    resizeToMin,
    resizeToFit,
    registerSeparator,
    unregisterSeparator,
  } = useGridResizableContext();

  const refCallback = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        registerSeparator(id, element, orientation);
      } else {
        unregisterSeparator(id);
      }
    },
    [id, orientation, registerSeparator, unregisterSeparator],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!(e.target instanceof HTMLElement)) return;

      e.preventDefault();
      e.target.setPointerCapture(e.pointerId);

      startResize(panelId, side, orientation);
    },
    [orientation, panelId, side, startResize],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const position = orientation === "horizontal" ? e.clientX : e.clientY;
      updateResize(position);
    },
    [orientation, updateResize],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleLostPointerCapture = useCallback(() => {
    endResize();
  }, [endResize]);

  const handleDoubleClick = useCallback(() => {
    if (!getOptimalSizeForFit) return;
    resizeToFit(panelId, getOptimalSizeForFit);
  }, [getOptimalSizeForFit, panelId, resizeToFit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? LARGE_STEP : undefined;
      // For "after" panels, arrow directions are reversed
      const directionMultiplier = side === "before" ? 1 : -1;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          resizeByKeyboard(panelId, -(step ?? 20) * directionMultiplier, orientation);
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          resizeByKeyboard(panelId, (step ?? 20) * directionMultiplier, orientation);
          break;
        case "Home":
          e.preventDefault();
          resizeToMin(panelId);
          break;
      }
    },
    [panelId, side, orientation, resizeByKeyboard, resizeToMin],
  );

  const panelSize = sizes[panelId] ?? 0;
  // aria-orientation is opposite of separator orientation
  const ariaOrientation = orientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <div
      ref={refCallback}
      data-slot="grid-resizable-separator"
      data-separator-id={id}
      data-orientation={orientation}
      role="separator"
      tabIndex={0}
      aria-orientation={ariaOrientation}
      aria-controls={panelId}
      aria-valuenow={Math.round(panelSize)}
      aria-label={`Resize ${panelId} panel`}
      className={cn(
        "hidden md:block", // Hidden on mobile, visible on desktop
        "group relative z-10 touch-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        {
          "-mx-[7.5px] h-full w-4 cursor-col-resize": orientation === "horizontal",
          "-my-[7.5px] h-4 w-full cursor-row-resize": orientation === "vertical",
        },
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Visual separator line - centered at 50% of wrapper */}
      <div
        className={cn(
          "absolute bg-border transition-all duration-150",
          "transition-all group-hover:bg-primary/50 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary/50",
          "group-focus-visible:bg-primary group-focus-visible:shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]",
          orientation === "horizontal"
            ? "top-0 bottom-0 left-1/2 w-px -translate-x-1/2 group-hover:w-0.5"
            : "top-1/2 right-0 left-0 h-px -translate-y-1/2 group-hover:h-0.5",
        )}
      />
    </div>
  );
}
