import { cn } from "cn";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/app-context";
import { useMessages } from "@/lib/locale/use-messages";
import { resetConfig } from "@/lib/utils";

export function Loading() {
  const m = useMessages();
  const { fileStore } = useAppContext();
  const [showReset, setShowReset] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReset(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center space-y-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-primary"
        aria-hidden
      ></div>
      <p role="status" className="text-muted-foreground">
        {m.common_loading()}
      </p>

      <div className={cn({ invisible: !showReset })} aria-hidden={!showReset}>
        <p className="text-muted-foreground">{m.loading_hint()}</p>
        <p className="mt-2 text-center">
          <Button variant="outline" onClick={() => resetConfig(fileStore)}>
            {m.error_reset_configuration()}
          </Button>
        </p>
      </div>
    </div>
  );
}
