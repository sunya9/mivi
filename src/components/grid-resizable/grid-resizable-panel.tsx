import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

interface GridResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  panelId: string;
  asChild?: boolean;
}

export function GridResizablePanel({
  panelId,
  asChild = false,
  className,
  ...props
}: GridResizablePanelProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      {...props}
      data-slot="grid-resizable-panel"
      data-panel-id={panelId}
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
    />
  );
}
