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
      aria-pressed={isDark}
      onClick={toggleTheme}
      className="p-2"
      size="icon"
      variant="icon"
    >
      {isDark ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        Switch theme to {isDark ? "light" : "dark"}
      </span>
    </Button>
  );
}
