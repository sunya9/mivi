"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = useCallback(() => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  }, [setTheme]);

  return (
    <Button
      aria-label="Switch Theme"
      onClick={toggleTheme}
      className="p-2"
      size="icon"
      variant="icon"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
