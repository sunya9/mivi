import { cn } from "cn";
import { useCallback } from "react";

import { useGridResizableContext } from "./grid-resizable-context";
import { getPanelElementId } from "./panel-element-id";

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
      id={getPanelElementId(panelId)}
      data-slot="grid-resizable-panel"
      data-panel-id={panelId}
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
