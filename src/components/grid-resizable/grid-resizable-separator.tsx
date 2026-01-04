import { useCallback, useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useGridResizableContext } from "./grid-resizable-context";
import { LARGE_KEYBOARD_STEP } from "./use-grid-resizable";
import type { GridResizableSeparatorProps } from "./types";

export function GridResizableSeparator({
  id,
  orientation,
  controls,
  area,
  className,
}: GridResizableSeparatorProps) {
  const {
    sizes,
    isMobile,
    startResize,
    updateResize,
    endResize,
    resizeByKeyboard,
  } = useGridResizableContext();

  const [beforeId, afterId] = controls;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      if (!(e.target instanceof HTMLElement)) return;

      e.preventDefault();
      e.target.setPointerCapture(e.pointerId);

      startResize(id, orientation, controls);
    },
    [isMobile, orientation, controls, id, startResize],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const position = orientation === "horizontal" ? e.clientX : e.clientY;
      updateResize(position);
    },
    [orientation, updateResize],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId);
      }
      endResize();
    },
    [endResize],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isMobile) return;

      const step = e.shiftKey ? LARGE_KEYBOARD_STEP : undefined;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          resizeByKeyboard(orientation, controls, -1, step);
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          resizeByKeyboard(orientation, controls, 1, step);
          break;
        case "Home":
          e.preventDefault();
          resizeByKeyboard(orientation, controls, -1, sizes[beforeId] ?? 1);
          break;
        case "End":
          e.preventDefault();
          resizeByKeyboard(orientation, controls, 1, sizes[afterId] ?? 1);
          break;
      }
    },
    [
      isMobile,
      orientation,
      controls,
      resizeByKeyboard,
      sizes,
      beforeId,
      afterId,
    ],
  );

  const valueNow = useMemo(() => {
    const beforeSize = sizes[beforeId] ?? 1;
    const afterSize = sizes[afterId] ?? 1;
    const total = beforeSize + afterSize;
    return Math.round((beforeSize / total) * 100);
  }, [sizes, beforeId, afterId]);

  const style: CSSProperties = {
    gridArea: area ?? id,
  };

  // aria-orientation is opposite of separator orientation
  // horizontal separator controls vertical split (and vice versa)
  const ariaOrientation =
    orientation === "horizontal" ? "vertical" : "horizontal";

  if (isMobile) {
    return null;
  }

  return (
    <div
      data-slot="grid-resizable-separator"
      data-separator-id={id}
      data-orientation={orientation}
      role="separator"
      tabIndex={0}
      aria-orientation={ariaOrientation}
      aria-controls={`${beforeId} ${afterId}`}
      aria-valuenow={valueNow}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Resize ${beforeId} and ${afterId} panels`}
      className={cn(
        "group relative z-10",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        orientation === "horizontal"
          ? "-mx-[7.5px] h-full w-4 cursor-col-resize"
          : "-my-[7.5px] h-4 w-full cursor-row-resize",
        className,
      )}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {/* Visual separator line - centered at 50% of wrapper */}
      <div
        className={cn(
          "bg-border absolute transition-all duration-150",
          "group-hover:bg-primary/50 group-hover:ring-primary/50 transition-all group-hover:shadow-lg group-hover:ring-2",
          "group-focus-visible:bg-primary group-focus-visible:shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]",
          orientation === "horizontal"
            ? "top-0 bottom-0 left-1/2 w-px -translate-x-1/2 group-hover:w-0.5"
            : "top-1/2 right-0 left-0 h-px -translate-y-1/2 group-hover:h-0.5",
        )}
      />
    </div>
  );
}
