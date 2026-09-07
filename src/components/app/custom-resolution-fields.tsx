import { useCallback, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  createCustomResolution,
  MAX_RESOLUTION_SIZE,
  MIN_RESOLUTION_SIZE,
  Resolution,
} from "@/lib/renderers/renderer";

interface SizeInputProps {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
  prefix: string;
  value: number;
  onCommit: (value: number) => number;
}

function SizeInput({ ref, label, prefix, value, onCommit }: SizeInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (syncedValue !== value) {
    setSyncedValue(value);
    setDraft(String(value));
  }

  const commit = useCallback(() => {
    const parsed = draft.trim() === "" ? Number.NaN : Number(draft);
    const committed = Number.isNaN(parsed) ? value : onCommit(parsed);
    setDraft(String(committed));
  }, [draft, onCommit, value]);

  return (
    <InputGroup className="w-24">
      <InputGroupAddon className="text-muted-foreground">{prefix}</InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={MIN_RESOLUTION_SIZE}
        max={MAX_RESOLUTION_SIZE}
        step={2}
        className="text-right"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
      />
    </InputGroup>
  );
}

interface Props {
  widthInputRef?: React.Ref<HTMLInputElement>;
  resolution: Resolution;
  onChange: (resolution: Resolution) => void;
}

export function CustomResolutionFields({ widthInputRef, resolution, onChange }: Props) {
  const commitWidth = useCallback(
    (width: number) => {
      const next = createCustomResolution(width, resolution.height, "width");
      onChange(next);
      return next.width;
    },
    [onChange, resolution.height],
  );
  const commitHeight = useCallback(
    (height: number) => {
      const next = createCustomResolution(resolution.width, height, "height");
      onChange(next);
      return next.height;
    },
    [onChange, resolution.width],
  );
  return (
    <div className="flex items-center gap-1.5">
      <SizeInput
        ref={widthInputRef}
        label="Width"
        prefix="W"
        value={resolution.width}
        onCommit={commitWidth}
      />
      <span className="text-muted-foreground">×</span>
      <SizeInput label="Height" prefix="H" value={resolution.height} onCommit={commitHeight} />
    </div>
  );
}
