import { ListMusic, Music, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";

export type MobileTabValue = "tracks" | "visualizer" | "style" | "settings";

interface TabConfig {
  value: MobileTabValue;
  label: string;
  icon: () => ReactNode;
}

const tabs: TabConfig[] = [
  {
    value: "tracks",
    label: "Tracks",
    icon: () => <ListMusic className="size-5" />,
  },
  {
    value: "visualizer",
    label: "Audio/Bg",
    icon: () => <Music className="size-5" />,
  },
  {
    value: "style",
    label: "Style",
    icon: () => <Palette className="size-5" />,
  },
  { value: "settings", label: "Settings", icon: SettingsIcon },
] as const;

function SettingsIcon() {
  const {
    needRefresh: [showUpdateIndicator],
  } = usePwaContext();

  return (
    <>
      <Settings className="size-5" />
      {showUpdateIndicator && (
        <span className="absolute -top-1 -right-1 flex size-2.5">
          <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
          <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
        </span>
      )}
    </>
  );
}

interface MobileBottomNavProps {
  value: MobileTabValue;
  onValueChange: (value: MobileTabValue) => void;
  className?: string;
}

export function MobileBottomNav({
  value,
  onValueChange,
  className,
}: MobileBottomNavProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={(v) => onValueChange(v as MobileTabValue)}
      className={cn(
        "bg-background border-border border-t drop-shadow",
        className,
      )}
    >
      <TabsPrimitive.List
        className={cn(
          "relative grid grid-cols-4",
          // Indicator element using CSS custom property for position-anchor
          "before:bg-secondary before:absolute before:m-1 before:rounded-md before:transition-all",
          "before:inset-[anchor(top)_anchor(right)_anchor(bottom)_anchor(left)] before:-z-10",
          "before:[position-anchor:var(--active-tab-anchor)]",
        )}
        style={
          { "--active-tab-anchor": `--tab-${value}` } as React.CSSProperties
        }
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "text-muted-foreground relative flex flex-1 flex-col items-center gap-1 border-transparent bg-clip-padding py-2 text-xs font-normal",
              "not-data-[state=active]:hover:text-primary data-[state=active]:text-primary",
              // Fallback for browsers without anchor positioning
              "not-supports-position-anchor:data-[state=active]:before:bg-secondary",
              "not-supports-position-anchor:before:absolute",
              "not-supports-position-anchor:before:inset-0",
              "not-supports-position-anchor:before:-z-10",
              "not-supports-position-anchor:before:m-1",
              "not-supports-position-anchor:before:rounded-md",
            )}
            style={{ anchorName: `--tab-${tab.value}` }}
          >
            <span className="relative">
              <tab.icon />
            </span>
            <span>{tab.label}</span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
