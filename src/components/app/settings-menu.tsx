import { useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, Monitor, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
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

export function SettingsMenu({ className }: Props) {
  const { theme, setTheme, systemTheme } = useTheme();
  const openKeyboardShortcuts = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "/",
        code: "Slash",
        shiftKey: true,
        bubbles: true,
      }),
    );
  }, []);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="none"
            className={cn(
              "max-md:bg-secondary max-md:text-secondary-foreground max-md:hover:bg-secondary/80 max-md:shadow-sm",
              "md:hover:bg-accent md:hover:text-accent-foreground md:dark:hover:bg-accent/50",
              "md:h-8 md:gap-1.5 md:rounded-md md:px-3 md:text-xs",
              className,
            )}
          >
            <Settings className="size-4" />
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={openKeyboardShortcuts}>
            <Keyboard className="mr-2 size-4" />
            Keyboard Shortcuts
            <DropdownMenuShortcut>?</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="mr-2 size-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={handleThemeChange}
              >
                {themes.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    onPointerDown={handlePointerDown}
                  >
                    <Icon className="mr-2 size-4" />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
