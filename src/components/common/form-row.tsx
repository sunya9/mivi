import { Field } from "@base-ui/react/field";
import { useId } from "react";

interface Props {
  label: React.ReactNode;
  controller: (props: { id: string }) => React.ReactNode;
}

export function FormRow({ label, controller }: Props) {
  const controlId = useId();

  return (
    <Field.Root className="flex items-center justify-between">
      <Field.Label className="flex-1">{label}</Field.Label>
      <div className="flex-none">{controller({ id: controlId })}</div>
    </Field.Root>
  );
}
