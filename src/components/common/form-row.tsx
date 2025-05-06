import { useId } from "react";

interface Props {
  label: React.ReactNode;
  controller:
    | React.ReactNode
    | ((props: { labelId: string }) => React.ReactNode);
}

export function FormRow({ label, controller }: Props) {
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <label
      className="-mx-6 my-4 flex items-center justify-between px-6"
      htmlFor={labelId}
    >
      <div className="flex-1" id={labelId}>
        {label}
      </div>
      <div className="flex-none" aria-labelledby={id}>
        {typeof controller === "function"
          ? controller({ labelId })
          : controller}
      </div>
    </label>
  );
}
