import { useCallback, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

function normalizeColor(input: string): string | null {
  let color = input.trim().toLowerCase();

  // Add hash if missing
  if (!color.startsWith("#")) {
    color = "#" + color;
  }

  // Expand 3-digit hex to 6-digit
  if (/^#[0-9a-f]{3}$/.test(color)) {
    color =
      "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // Validate 6-digit hex
  if (/^#[0-9a-f]{6}$/.test(color)) {
    return color;
  }

  return null;
}

export function ColorPickerInput({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  id,
  disabled,
}: ColorPickerInputProps) {
  const generatedId = useId();
  const textInputId = id ?? generatedId;
  const colorPickerId = `${textInputId}-color-picker`;

  const [inputValue, setInputValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleNativePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Ensure # is always at the beginning
      if (!newValue.startsWith("#")) {
        // If user deleted #, restore it
        newValue = "#" + newValue.replace(/#/g, "");
      }

      // Limit to 7 characters (#RRGGBB)
      if (newValue.length <= 7) {
        setInputValue(newValue);
      }
    },
    [],
  );

  const handleCommit = useCallback(() => {
    const normalized = normalizeColor(inputValue);
    if (normalized && normalized !== value) {
      onChange(normalized);
    } else if (!normalized) {
      // Revert to original value on invalid input
      setInputValue(value);
    }
  }, [inputValue, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCommit();
      }
    },
    [handleCommit],
  );

  const normalizedInputColor = normalizeColor(inputValue);
  const isInvalid = normalizedInputColor === null;
  // Show preview of valid input color, fallback to committed value
  const previewColor = normalizedInputColor ?? value;

  return (
    <InputGroup
      className={cn("h-8 w-fit", className)}
      data-disabled={disabled || undefined}
    >
      <InputGroupAddon align="inline-start" className="pl-1.5">
        <div
          className={cn(
            "relative size-5 overflow-hidden rounded-sm",
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
          )}
          style={{ backgroundColor: previewColor }}
        >
          <input
            id={colorPickerId}
            type="color"
            value={value}
            onChange={handleNativePickerChange}
            aria-label={ariaLabel ? `${ariaLabel} picker` : "Color picker"}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={disabled}
            tabIndex={-1}
          />
        </div>
      </InputGroupAddon>
      <InputGroupInput
        id={textInputId}
        type="text"
        value={inputValue}
        onChange={handleTextChange}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-invalid={isInvalid || undefined}
        disabled={disabled}
        className="h-8 w-[9ch] font-mono"
      />
    </InputGroup>
  );
}
