import { cn } from "@/lib/utils";

interface GridResizablePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "render"> {
  panelId: string;
}

export function GridResizablePanel({
  panelId,
  className,
  children,
  ...props
}: GridResizablePanelProps) {
  const sharedProps = {
    ...props,
    "data-slot": "grid-resizable-panel",
    "data-panel-id": panelId,
    className: cn("min-h-0 min-w-0 overflow-hidden", className),
  };

  return <div {...sharedProps}>{children}</div>;
}
