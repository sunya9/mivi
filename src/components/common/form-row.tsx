import { useId } from "react";

interface Props {
  label: React.ReactNode;
  controller: React.ReactNode | ((props: { id: string }) => React.ReactNode);
}

export function FormRow({ label, controller }: Props) {
  const id = useId();
  const isFunction = typeof controller === "function";

  return (
    <label className="-mx-6 flex items-center justify-between px-6">
      <div className="flex-1" id={id}>
        {label}
      </div>
      <div className="flex-none" aria-labelledby={isFunction ? id : undefined}>
        {isFunction ? controller({ id }) : controller}
      </div>
    </label>
  );
}
