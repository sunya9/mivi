import { ListMusic, Music, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";

const tabs = [
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
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
  },
] as const satisfies readonly {
  value: string;
  label: string;
  icon: () => ReactNode;
}[];

export type MobileTabValue = (typeof tabs)[number]["value"];

function SettingsIcon() {
  const {
    needRefresh: [showUpdateIndicator],
  } = usePwaContext();

  return (
    <>
      <Settings className="size-5" />
      {showUpdateIndicator && (
        <span className="absolute -top-1 -right-1 flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
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

export function MobileBottomNav({ value, onValueChange, className }: MobileBottomNavProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={(v: MobileTabValue) => onValueChange(v)}
      className={cn("border-t border-border bg-background drop-shadow", className)}
    >
      <TabsPrimitive.List className="relative grid grid-cols-4">
        <TabsPrimitive.Indicator className="absolute inset-y-0 right-(--active-tab-right) left-(--active-tab-left) -z-10 m-1 rounded-md bg-secondary transition-all" />
        {tabs.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 border-transparent bg-clip-padding py-2 text-xs font-normal text-muted-foreground",
              "not-data-active:hover:text-primary data-active:text-primary",
            )}
          >
            <span className="relative">
              <tab.icon />
            </span>
            <span>{tab.label}</span>
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
