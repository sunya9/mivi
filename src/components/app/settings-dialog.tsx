import { Palette, Info, Keyboard } from "lucide-react";
import {
  useCallback,
  RefAttributes,
  SVGProps,
  ForwardRefExoticComponent,
  Activity,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AboutContent } from "./about-content";
import { KeyboardShortcutsContent } from "./keyboard-shortcuts-content";
import { ThemeSettings } from "./theme-settings";

const navGroups = [
  {
    label: "Preferences",
    items: [{ value: "general" as const, name: "General", icon: Palette }],
  },
  {
    label: "Help",
    items: [
      { value: "shortcuts" as const, name: "Shortcuts", icon: Keyboard },
      { value: "about" as const, name: "About", icon: Info },
    ],
  },
] satisfies readonly {
  label: string;
  items: readonly {
    value: string;
    name: string;
    icon: ForwardRefExoticComponent<RefAttributes<SVGSVGElement> & SVGProps<SVGSVGElement>>;
  }[];
}[];

export type SettingsTabValue = (typeof navGroups)[number]["items"][number]["value"];

interface SettingsDialogProps {
  tab?: SettingsTabValue;
  onTabChange: (tab: SettingsTabValue | undefined) => void;
}

export function SettingsDialog({ tab, onTabChange }: SettingsDialogProps) {
  // Open settings dialog with shortcuts tab on "?" key
  useHotkeys("shift+slash", () => {
    onTabChange("shortcuts");
  });
  const open = !!tab;
  const [lastTab, setLastTab] = useState<SettingsTabValue>("general");
  if (tab && tab !== lastTab) {
    setLastTab(tab);
  }
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onTabChange(newOpen ? "general" : undefined);
    },
    [onTabChange],
  );
  // Focus the dialog itself on open so screen readers announce the title first,
  // instead of jumping into the first sidebar item
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={popupRef}
        initialFocus={popupRef}
        className="overflow-hidden p-0 md:max-w-175"
      >
        <SettingsDialogContent activeTab={lastTab} onTabChange={onTabChange} />
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialogContent({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTabValue;
  onTabChange: (tab: SettingsTabValue) => void;
}) {
  const modeForTab = useCallback(
    (tab: SettingsTabValue) => {
      return tab === activeTab ? "visible" : "hidden";
    },
    [activeTab],
  );

  return (
    <>
      <DialogTitle className="sr-only">Settings</DialogTitle>
      <DialogDescription className="sr-only">
        Application settings and information
      </DialogDescription>
      <SidebarProvider className="min-h-0 items-start" style={{ "--sidebar-width": "12rem" }}>
        <Sidebar collapsible="none" className="hidden py-3.5 md:flex">
          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton
                          isActive={activeTab === item.value}
                          onClick={() => onTabChange(item.value)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <ScrollArea className="relative h-107.5 max-h-107.5">
            <div className="p-4">
              <Activity mode={modeForTab("general")}>
                <ThemeSettings />
              </Activity>
              <Activity mode={modeForTab("about")}>
                <AboutContent />
              </Activity>
              <Activity mode={modeForTab("shortcuts")}>
                <KeyboardShortcutsContent />
              </Activity>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

interface SettingsContentProps {
  className?: string;
}

export function SettingsContent({ className }: SettingsContentProps) {
  return (
    <Tabs defaultValue="general" className={className}>
      <TabsList variant="line-indicator" className="w-full">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <div>
        <TabsContent value="general" className="py-4">
          <ThemeSettings />
        </TabsContent>
        <TabsContent value="about" className="py-4">
          <AboutContent />
        </TabsContent>
      </div>
    </Tabs>
  );
}
