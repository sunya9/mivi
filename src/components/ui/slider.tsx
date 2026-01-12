import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

/**
 * Reason for value change, similar to Base UI's eventDetails.reason
 * @see https://base-ui.com/react/components/slider
 */
type SliderChangeReason = "keyboard" | "pointer-down" | "drag";

interface SliderProps extends Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "onValueChange" | "onValueCommit" | "onPointerDown"
> {
  /**
   * Called when a pointer down occurs on the slider.
   * Useful for preparing state before value changes.
   */
  onPointerDown?: () => void;
  /**
   * Called when the slider value changes.
   * @param value - The new value(s)
   * @param reason - What triggered the change: "keyboard", "pointer-down", or "drag"
   */
  onValueChange?: (value: number[], reason: SliderChangeReason) => void;
  /**
   * Called when the value is committed (pointer up or keyboard navigation complete).
   * @param value - The committed value(s)
   * @param reason - What triggered the commit: "keyboard", "pointer-down", or "drag"
   */
  onValueCommit?: (value: number[], reason: SliderChangeReason) => void;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  onPointerDown,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  // Track interaction state to determine reason
  const isPointerDownRef = React.useRef(false);
  const valueChangeCountRef = React.useRef(0);
  const committedRef = React.useRef(false);
  const lastValueRef = React.useRef<number[]>([]);

  // For onValueChange: first change is "pointer-down", subsequent are "drag"
  const getChangeReason = (): SliderChangeReason => {
    if (!isPointerDownRef.current) return "keyboard";
    return valueChangeCountRef.current > 0 ? "drag" : "pointer-down";
  };

  // For onValueCommit: single change means click ("pointer-down"), multiple means drag
  const getCommitReason = (): SliderChangeReason => {
    if (!isPointerDownRef.current) return "keyboard";
    return valueChangeCountRef.current > 1 ? "drag" : "pointer-down";
  };

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      // Spread props first so internal handlers are not overridden
      {...props}
      onPointerDown={() => {
        isPointerDownRef.current = true;
        valueChangeCountRef.current = 0;
        committedRef.current = false;
        // Initialize lastValueRef with current value so onLostPointerCapture
        // can call onValueCommit even if no value change occurred
        lastValueRef.current = _values;
        onPointerDown?.();
      }}
      onValueChange={(newValue) => {
        const reason = getChangeReason();
        valueChangeCountRef.current++;
        lastValueRef.current = newValue;
        onValueChange?.(newValue, reason);
      }}
      onValueCommit={(newValue) => {
        committedRef.current = true;
        onValueCommit?.(newValue, getCommitReason());
      }}
      // Fallback commit on pointer capture loss
      // onValueCommit may not fire reliably in Radix, but onLostPointerCapture does
      // https://github.com/radix-ui/primitives/issues/1760#issuecomment-2133137759
      onLostPointerCapture={() => {
        if (
          isPointerDownRef.current &&
          !committedRef.current &&
          lastValueRef.current.length > 0
        ) {
          onValueCommit?.(lastValueRef.current, getCommitReason());
        }
        isPointerDownRef.current = false;
      }}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
export type { SliderProps, SliderChangeReason };
