"use client";

import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";
import { useCallback } from "react";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = useCallback(() => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  }, [setTheme]);

  return (
    <Toggle
      aria-label="Switch Theme"
      pressed={isDark}
      onPressedChange={toggleTheme}
      className="p-2"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Toggle>
  );
}
