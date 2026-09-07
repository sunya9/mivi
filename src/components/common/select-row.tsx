import { Select as SelectPrimitive } from "@base-ui/react/select";

import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props<Value, Multiple extends boolean | undefined> = SelectPrimitive.Root.Props<
  Value,
  Multiple
> & {
  label: React.ReactNode;
  placeholder?: string;
  triggerClassName?: string;
  valueClassName?: string;
};

export function SelectRow<Value, Multiple extends boolean | undefined = false>({
  label,
  placeholder,
  triggerClassName,
  valueClassName,
  children,
  ...props
}: Props<Value, Multiple>) {
  return (
    <div className="flex items-center justify-between">
      <Select {...props}>
        <SelectPrimitive.Label className="flex-1">{label}</SelectPrimitive.Label>
        <SelectTrigger className={cn("w-48", triggerClassName)}>
          <SelectValue className={valueClassName} placeholder={placeholder} />
        </SelectTrigger>
        {children}
      </Select>
    </div>
  );
}
