import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  SliderPrimitive.Root.Props,
  "onValueChange" | "onValueCommitted"
> & {
  onValueChange?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.ChangeEventDetails,
  ) => void;
  onValueCommitted?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.CommitEventDetails,
  ) => void;
};

function toArray(v: number | readonly number[]): number[] {
  return typeof v === "number" ? [v] : Array.from(v);
}

function isArray(
  v: SliderPrimitive.Root.Props["value"],
): v is readonly number[] {
  return Array.isArray(v);
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
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  const step = props.step ?? 1;
  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
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
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
