import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";
import * as React from "react";

type SliderProps = Omit<SliderPrimitive.Root.Props, "onValueChange" | "onValueCommitted"> & {
  onValueChange?: (value: number[], eventDetails: SliderPrimitive.Root.ChangeEventDetails) => void;
  onValueCommitted?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.CommitEventDetails,
  ) => void;
  label?: React.ReactNode;
  labelClassName?: string;
  controlClassName?: string;
};

function toArray(v: number | readonly number[]): number[] {
  return typeof v === "number" ? [v] : Array.from(v);
}

function isArray(v: SliderPrimitive.Root.Props["value"]): v is readonly number[] {
  return Array.isArray(v);
}

/**
 * Base UI measures inset thumbs once after mount and never re-measures on its own, so a slider
 * that mounts inside a hidden container keeps an unpositioned thumb. Remount it when it appears.
 */
function useRemountWhenShown() {
  const [mountKey, setMountKey] = React.useState(0);
  const controlRef = React.useCallback((control: HTMLElement | null) => {
    if (!control || typeof ResizeObserver === "undefined") return;
    if (control.getClientRects().length > 0) return;
    const observer = new ResizeObserver(() => {
      if (control.getClientRects().length === 0) return;
      observer.disconnect();
      setMountKey((key) => key + 1);
    });
    observer.observe(control);
    return () => observer.disconnect();
  }, []);
  return { mountKey, controlRef };
}

function roundToStep(value: number, step: number): number {
  const precision = Math.max(0, -Math.floor(Math.log10(step)));
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  label,
  labelClassName,
  controlClassName,
  ...props
}: SliderProps) {
  const ariaLabel = props["aria-label"];
  const _values = React.useMemo(
    () => (isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  );

  const step = props.step ?? 1;
  const { mountKey, controlRef } = useRemountWhenShown();
  const getAriaLabel = React.useMemo(() => (ariaLabel ? () => ariaLabel : undefined), [ariaLabel]);
  return (
    <SliderPrimitive.Root
      key={mountKey}
      className={cn("group data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge-client-only"
      onValueChange={(v, details) => {
        onValueChange?.(
          toArray(v).map((n) => roundToStep(n, step)),
          details,
        );
      }}
      onValueCommitted={(v, details) => {
        onValueCommitted?.(
          toArray(v).map((n) => roundToStep(n, step)),
          details,
        );
      }}
      {...props}
    >
      {label != null && (
        <SliderPrimitive.Label data-slot="slider-label" className={labelClassName}>
          {label}
        </SliderPrimitive.Label>
      )}
      <SliderPrimitive.Control
        ref={controlRef}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-horizontal:min-h-5 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
          controlClassName,
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none group-hover:bg-foreground/5 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary transition select-none group-hover:bg-primary-alt data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            getAriaLabel={getAriaLabel}
            className="block size-3 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition select-none group-hover:bg-primary-alt hover:ring-4 disabled:pointer-events-none disabled:opacity-50 has-focus-visible:ring-4 has-focus-visible:outline-hidden"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
