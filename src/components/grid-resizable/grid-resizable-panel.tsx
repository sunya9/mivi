import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useGridResizableContext } from "./grid-resizable-context";

interface GridResizablePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "render"> {
  panelId: string;
}

export function GridResizablePanel({
  panelId,
  className,
  children,
  ...props
}: GridResizablePanelProps) {
  const { registerPanel, unregisterPanel } = useGridResizableContext();

  const refCallback = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        registerPanel(panelId, element);
      } else {
        unregisterPanel(panelId);
      }
    },
    [panelId, registerPanel, unregisterPanel],
  );

  return (
    <div
      ref={refCallback}
      {...props}
      data-slot="grid-resizable-panel"
      data-panel-id={panelId}
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
