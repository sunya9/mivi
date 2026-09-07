import { useState } from "react";

import { AppHeader } from "@/components/app/app-header";
import { CommonConfigPane } from "@/components/app/common-config-pane";
import { ConfirmDialogHost } from "@/components/app/confirm-dialog-host";
import { FileDropZone } from "@/components/app/file-drop-zone";
import { FooterPanel } from "@/components/app/footer-panel";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { MobileBottomNav, type MobileTabValue } from "@/components/app/mobile-bottom-nav";
import {
  SettingsDialog,
  SettingsContent,
  type SettingsTabValue,
} from "@/components/app/settings-dialog";
import { TrackListPane } from "@/components/app/track-list-pane";
import { VisualizerStylePane } from "@/components/app/visualizer-style-pane";
import {
  GridResizablePanelGroup,
  GridResizablePanel,
  GridResizableSeparator,
  type PanelConfig,
} from "@/components/grid-resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { useVisualizerFit } from "@/hooks/use-visualizer-fit";
import { cn } from "@/lib/utils";

const PANELS: PanelConfig[] = [
  { id: "track-list", defaultSize: 300, constraints: { minSize: 200 } },
  { id: "visualizer", defaultSize: 400, constraints: { minSize: 200 } },
  { id: "style", defaultSize: 300, constraints: { minSize: 200 } },
];

export function App() {
  const { rendererConfigStore } = useAppContext();
  const resolution = useStore(rendererConfigStore, (config) => config.resolution);

  const [mobileTab, setMobileTab] = useState<MobileTabValue>("visualizer");

  // Settings dialog state
  const [settingsTab, setSettingsTab] = useState<SettingsTabValue | undefined>(undefined);

  const {
    containerRef: visualizerContainerRef,
    getVisualizerOptimalHeight,
    getCenterFitSize,
  } = useVisualizerFit(resolution);

  return (
    <FileDropZone>
      <GridResizablePanelGroup
        id="main-layout"
        panels={PANELS}
        className="mx-auto grid-main-layout max-h-dvh min-h-dvh overflow-hidden"
      >
        <AppHeader className="area-[header]" />
        <main className="contents">
          <GridResizablePanel
            panelId="visualizer"
            className={cn("max-h-[calc(100dvh/3)] area-[visualizer] md:max-h-none", {
              "hidden md:block": mobileTab === "settings",
            })}
          >
            <MidiVisualizer containerRef={visualizerContainerRef} />
          </GridResizablePanel>
          <GridResizablePanel
            panelId="track-list"
            className={cn(
              "area-[content] md:block md:area-[track-list]",
              mobileTab === "tracks" ? "block" : "hidden",
            )}
          >
            <ScrollArea className="@container h-full w-full">
              <TrackListPane />
            </ScrollArea>
          </GridResizablePanel>

          <GridResizableSeparator
            id="sep-h1"
            orientation="horizontal"
            panelId="track-list"
            side="before"
            className="area-[sep-h1]"
            getOptimalSizeForFit={(sizes) => getCenterFitSize("track-list", sizes)}
          />

          <GridResizableSeparator
            id="sep-v"
            orientation="vertical"
            panelId="visualizer"
            side="before"
            className="area-[sep-v]"
            getOptimalSizeForFit={getVisualizerOptimalHeight}
          />

          <GridResizablePanel
            panelId="config"
            className={cn(
              "area-[content] md:block md:area-[config]",
              mobileTab === "visualizer" ? "block" : "hidden",
            )}
          >
            <ScrollArea className="h-full w-full">
              <CommonConfigPane />
            </ScrollArea>
          </GridResizablePanel>

          <GridResizableSeparator
            id="sep-h2"
            orientation="horizontal"
            panelId="style"
            side="after"
            className="area-[sep-h2]"
            getOptimalSizeForFit={(sizes) => getCenterFitSize("style", sizes)}
          />

          <GridResizablePanel
            panelId="style"
            className={cn(
              "area-[content] md:block md:area-[style]",
              mobileTab === "style" ? "block" : "hidden",
            )}
          >
            <VisualizerStylePane />
          </GridResizablePanel>
          <GridResizablePanel
            panelId="settings"
            className={cn(
              "area-[content] md:hidden",
              mobileTab === "settings" ? "block" : "hidden",
            )}
          >
            <ScrollArea className="h-full w-full px-6 py-4">
              <SettingsContent />
            </ScrollArea>
          </GridResizablePanel>
        </main>

        <GridResizablePanel panelId="about" className="hidden area-[about] md:block md:border-t">
          <FooterPanel onOpenSettings={() => setSettingsTab("general")} />
        </GridResizablePanel>

        <MobileBottomNav
          className="area-[nav] md:hidden"
          value={mobileTab}
          onValueChange={setMobileTab}
        />
        <SettingsDialog tab={settingsTab} onTabChange={setSettingsTab} />
        <Toaster />
        <ConfirmDialogHost />
      </GridResizablePanelGroup>
    </FileDropZone>
  );
}
