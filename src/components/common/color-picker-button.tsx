import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ColorPickerButtonProps {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

export function ColorPickerButton({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: ColorPickerButtonProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "border-input relative size-6 overflow-hidden rounded-md border shadow-xs",
        "has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]",
        "cursor-pointer transition-shadow",
        className,
      )}
      style={{ backgroundColor: value }}
    >
      <input
        type="color"
        value={value}
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={ariaLabel}
      />
    </div>
  );
}
