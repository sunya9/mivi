import { Button } from "@/components/ui/button";
import { useResetConfig } from "@/lib/useResetConfig";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const Loading = () => {
  const [showReset, setShowReset] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReset(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  const resetConfig = useResetConfig();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-blue-500"></div>
      <p className="mt-4 text-gray-500">Loading...</p>

      <div
        className={cn({
          invisible: !showReset,
        })}
      >
        <p className="text-gray-500">
          If nothing appears after a few seconds, please try resetting.
        </p>
        <p className="mt-2 text-center">
          <Button variant="outline" onClick={resetConfig}>
            Reset configuration
          </Button>
        </p>
      </div>
    </div>
  );
};
