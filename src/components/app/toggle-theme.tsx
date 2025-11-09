import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation";

export function ToggleTheme() {
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    blurAmount: 4,
    duration: 400,
  });

  return (
    <Button
      aria-pressed={isDarkMode}
      onClick={toggleSwitchTheme}
      className="p-2"
      size="icon"
      variant="icon"
      ref={ref}
    >
      {isDarkMode ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        Switch theme to {isDarkMode ? "light" : "dark"}
      </span>
    </Button>
  );
}
