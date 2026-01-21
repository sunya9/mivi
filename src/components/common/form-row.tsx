import { useCallback, useId, useRef } from "react";

interface Props {
  label: React.ReactNode;
  controller: (props: {
    id: string;
    labelId: string;
    ref: React.RefObject<HTMLElement | null>;
  }) => React.ReactNode;
  customControl?: boolean;
}

export function FormRow({ label, controller, customControl = false }: Props) {
  const labelId = useId();
  const controlId = useId();
  const ref = useRef<HTMLElement>(null);
  const handleClick = useCallback(() => {
    ref.current?.focus();
  }, []);

  const Comp = customControl ? "div" : "label";

  return (
    <Comp
      className="-mx-6 flex items-center justify-between px-6"
      {...(customControl ? { onClick: handleClick } : { htmlFor: controlId })}
    >
      <div id={labelId} className="flex-1">
        {label}
      </div>
      <div className="flex-none">
        {controller({ id: controlId, labelId, ref })}
      </div>
    </Comp>
  );
}
