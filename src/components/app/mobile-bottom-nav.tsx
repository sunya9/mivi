import { ListMusic, Settings, Palette, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { usePwaContext } from "@/pwa/use-pwa-context";

export type MobileTabValue = "tracks" | "visualizer" | "style" | "about";

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
    label: "Settings",
    icon: () => <Settings className="size-5" />,
  },
  {
    value: "style",
    label: "Style",
    icon: () => <Palette className="size-5" />,
  },
  { value: "about", label: "About", icon: AboutIcon },
] as const;

function AboutIcon() {
  const {
    needRefresh: [showAboutIndicator],
  } = usePwaContext();

  return (
    <>
      <Info className="size-5" />
      {showAboutIndicator && (
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
          "before:absolute before:inset-[anchor(--tab_top)_anchor(--tab_right)_anchor(--tab_bottom)_anchor(--tab_left)] before:-z-10 before:[position-anchor:--tab]",
          "before:bg-secondary before:m-1 before:rounded-md before:transition-all before:duration-1000",
        )}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "text-muted-foreground relative flex flex-1 flex-col items-center gap-1 border-transparent bg-clip-padding py-2 text-xs font-normal",
              "not-data-[state=active]:hover:text-primary data-[state=active]:text-primary",
              "[:active,[data-state=active]]:[anchor-name:--tab]",
              "not-supports-position-anchor:data-[state=active]:before:bg-secondary",
              "not-supports-position-anchor:before:absolute",
              "not-supports-position-anchor:before:inset-0",
              "not-supports-position-anchor:before:-z-10",
              "not-supports-position-anchor:before:m-1",
              "not-supports-position-anchor:before:rounded-md",
            )}
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
