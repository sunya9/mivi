import { useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

function getResolvedTheme(
  theme: string,
  systemTheme: string | undefined,
): string {
  if (theme === "system") {
    return systemTheme ?? "light";
  }
  return theme;
}

function shouldAnimate(
  currentTheme: string | undefined,
  newTheme: string,
  systemTheme: string | undefined,
): boolean {
  if (!currentTheme) return false;
  const currentResolved = getResolvedTheme(currentTheme, systemTheme);
  const newResolved = getResolvedTheme(newTheme, systemTheme);
  return currentResolved !== newResolved;
}

function setTransitionOrigin(options?: { x: number; y: number }) {
  if (options) {
    document.documentElement.style.setProperty(
      "--theme-transition-x",
      `${options.x}px`,
    );
    document.documentElement.style.setProperty(
      "--theme-transition-y",
      `${options.y}px`,
    );
  } else {
    document.documentElement.style.removeProperty("--theme-transition-x");
    document.documentElement.style.removeProperty("--theme-transition-y");
  }
}

interface ThemeSettingsProps {
  /**
   * Enable View Transition animation when switching themes.
   * @default true
   */
  animateTransition?: boolean;
}

export function ThemeSettings({
  animateTransition = true,
}: ThemeSettingsProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const clickPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    clickPositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleThemeChange = useCallback(
    async (newTheme: string) => {
      const animate =
        animateTransition && shouldAnimate(theme, newTheme, systemTheme);
      if (!animate || !document.startViewTransition) {
        setTheme(newTheme);
        return;
      }

      if (clickPositionRef.current) {
        setTransitionOrigin({
          x: clickPositionRef.current.x,
          y: clickPositionRef.current.y,
        });
      }
      const transition = document.startViewTransition({
        update: () => {
          setTheme(newTheme);
        },
        types: ["theme-change"],
      });
      await transition.finished;
      setTransitionOrigin();
    },
    [animateTransition, theme, systemTheme, setTheme],
  );

  return (
    <div className="space-y-4">
      <h2 className="hidden text-lg font-semibold md:block">General</h2>
      <div className="space-y-3">
        <h3 className="text-base font-medium">Theme</h3>
        <RadioGroup value={theme} onValueChange={handleThemeChange}>
          {themes.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-3">
              <RadioGroupItem
                value={value}
                id={`theme-${value}`}
                onPointerDown={handlePointerDown}
              />
              <Label htmlFor={`theme-${value}`} className="font-normal">
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
