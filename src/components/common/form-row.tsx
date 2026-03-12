import { useCallback, useId, useRef } from "react";
import { Field } from "@base-ui/react/field";

interface Props {
  label: React.ReactNode;
  controller: (props: {
    id: string;
    labelId: string;
    ref: React.RefObject<HTMLDivElement | null>;
  }) => React.ReactNode;
  customControl?: boolean;
}

const FOCUSABLE_SELECTOR =
  '[role="switch"], [role="combobox"], input[type="range"]';

export function FormRow({ label, controller, customControl = false }: Props) {
  const labelId = useId();
  const controlId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClick = useCallback(() => {
    const container = containerRef.current;
    container
      ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ?.focus({ focusVisible: true } as FocusOptions);
  }, []);

  if (customControl) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-between"
        onClick={handleClick}
      >
        <div id={labelId} className="flex-1">
          {label}
        </div>
        <div className="flex-none">
          {controller({ id: controlId, labelId, ref })}
        </div>
      </div>
    );
  }

  return (
    <Field.Root
      ref={containerRef}
      className="flex items-center justify-between"
      onClick={handleClick}
    >
      <Field.Label className="flex-1">{label}</Field.Label>
      <div className="flex-none">
        {controller({ id: controlId, labelId, ref })}
      </div>
    </Field.Root>
  );
}
