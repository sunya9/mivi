import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

interface Props {
  className?: string;
}

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

export function ThemeSelect({ className }: Props) {
  const { theme, setTheme, systemTheme } = useTheme();
  const clickPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    clickPositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleThemeChange = useCallback(
    async (newTheme: string) => {
      const animate = shouldAnimate(theme, newTheme, systemTheme);
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
      const transition = document.startViewTransition(() => {
        setTheme(newTheme);
      });
      await transition.finished;
      setTransitionOrigin();
    },
    [theme, systemTheme, setTheme],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          className={cn(
            "max-md:bg-secondary max-md:text-secondary-foreground max-md:hover:bg-secondary/80 max-md:shadow-sm", // secondary style on mobile
            "md:hover:bg-accent md:hover:text-accent-foreground md:dark:hover:bg-accent/50", // ghost style on desktop
            "md:h-8 md:gap-1.5 md:rounded-md md:px-3 md:text-xs", // sm style on desktop
            className,
          )}
        >
          <PaletteIcon />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              onPointerDown={handlePointerDown}
            >
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
