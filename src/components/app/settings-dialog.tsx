import {
  useCallback,
  useRef,
  RefAttributes,
  SVGProps,
  ForwardRefExoticComponent,
  Activity,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Palette, Info, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ThemeSettings } from "./theme-settings";
import { AboutContent } from "./about-content";
import { KeyboardShortcutsContent } from "./keyboard-shortcuts-content";

const navItems = [
  { value: "general" as const, name: "General", icon: Palette },
  { value: "about" as const, name: "About", icon: Info },
  { value: "shortcuts" as const, name: "Shortcuts", icon: Keyboard },
] satisfies readonly {
  value: string;
  name: string;
  icon: ForwardRefExoticComponent<
    RefAttributes<SVGSVGElement> & SVGProps<SVGSVGElement>
  >;
}[];

export type SettingsTabValue = (typeof navItems)[number]["value"];

interface SettingsDialogProps {
  tab?: SettingsTabValue;
  onTabChange: (tab: SettingsTabValue | undefined) => void;
}

export function SettingsDialog({ tab, onTabChange }: SettingsDialogProps) {
  // Open settings dialog with shortcuts tab on "?" key
  useHotkeys("shift+slash", () => {
    onTabChange("shortcuts");
  });
  const open = tab !== undefined;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onTabChange(newOpen ? "general" : undefined);
    },
    [onTabChange],
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    closeButtonRef.current?.focus();
  }, []);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 md:max-w-175"
        onOpenAutoFocus={handleOpenAutoFocus}
        closeButtonRef={closeButtonRef}
      >
        {tab && (
          <SettingsDialogContent activeTab={tab} onTabChange={onTabChange} />
        )}
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
      <SidebarProvider className="min-h-0 items-start">
        <Sidebar collapsible="none" className="hidden md:flex">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
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
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <ScrollArea className="relative h-107.5 max-h-107.5" type="auto">
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
      <TabsList variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
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
