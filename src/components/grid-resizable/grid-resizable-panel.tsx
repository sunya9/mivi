import { cn } from "@/lib/utils";

interface GridResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  panelId: string;
}

export function GridResizablePanel({
  panelId,
  children,
  className,
}: GridResizablePanelProps) {
  return (
    <div
      data-slot="grid-resizable-panel"
      data-panel-id={panelId}
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
