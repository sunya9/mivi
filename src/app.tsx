import { useState, useMemo } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useVisualizerFit } from "@/hooks/use-visualizer-fit";
import {
  GridResizablePanelGroup,
  GridResizablePanel,
  GridResizableSeparator,
  type PanelConfig,
} from "@/components/grid-resizable";
import { AppHeader } from "@/components/app/app-header";
import { TrackListPane } from "@/components/app/track-list-pane";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { CommonConfigPane } from "@/components/app/common-config-pane";
import { FooterPanel } from "@/components/app/footer-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMidi } from "@/lib/midi/use-midi";
import { useAudio } from "@/lib/audio/use-audio";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { useRendererConfig } from "@/lib/renderers/use-renderer-config";
import { useBackgroundImage } from "./lib/background-image/use-background-image";
import { useDnd } from "@/hooks/use-dnd";
import { MobileBottomNav, type MobileTabValue } from "@/components/app/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import {
  SettingsDialog,
  SettingsContent,
  type SettingsTabValue,
} from "@/components/app/settings-dialog";

export function App() {
  const { setMidiFile, midiTracks, setMidiTracks, ConfirmDialog } = useMidi();
  const { rendererConfig, onUpdateRendererConfig, VisualizerStyle } = useRendererConfig(
    midiTracks?.minNote,
    midiTracks?.maxNote,
  );
  const { audioFile, setAudioFile, audioSource, serializedAudio, isDecoding, cancelDecode } =
    useAudio();
  const { backgroundImageBitmap, setBackgroundImageFile, backgroundImageFile } =
    useBackgroundImage();
  const { recordingState, toggleRecording } = useRecorder({
    midiTracks,
    audioSource,
    rendererConfig,
    backgroundImageBitmap,
  });

  const { handleDrop, handleDragOver, handleDragLeave, DragDropOverlay } = useDnd({
    onDropMidi: setMidiFile,
    onDropAudio: setAudioFile,
    onDropImage: setBackgroundImageFile,
  });

  const [mobileTab, setMobileTab] = useState<MobileTabValue>("visualizer");

  // Settings dialog state
  const [settingsTab, setSettingsTab] = useState<SettingsTabValue | undefined>(undefined);

  const {
    containerRef: visualizerContainerRef,
    getVisualizerOptimalHeight,
    getCenterFitSize,
  } = useVisualizerFit(rendererConfig.resolution);

  const panels = useMemo<PanelConfig[]>(
    () => [
      { id: "track-list", defaultSize: 300, constraints: { minSize: 200 } },
      { id: "visualizer", defaultSize: 400, constraints: { minSize: 200 } },
      { id: "style", defaultSize: 300, constraints: { minSize: 200 } },
    ],
    [],
  );

  return (
    <GridResizablePanelGroup
      id="main-layout"
      panels={panels}
      className="mx-auto grid-main-layout max-h-dvh min-h-dvh overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {DragDropOverlay}
      <AppHeader
        toggleRecording={toggleRecording}
        recordingState={recordingState}
        className="area-[header]"
      />
      <GridResizablePanel
        panelId="visualizer"
        className={cn("max-h-[calc(100dvh/3)] area-[visualizer] md:max-h-none", {
          "hidden md:block": mobileTab === "settings",
        })}
      >
        <MidiVisualizer
          rendererConfig={rendererConfig}
          midiTracks={midiTracks}
          backgroundImageBitmap={backgroundImageBitmap}
          serializedAudio={serializedAudio}
          containerRef={visualizerContainerRef}
        />
      </GridResizablePanel>
      <GridResizablePanel
        panelId="track-list"
        className={cn(
          "area-[content] md:block md:area-[track-list]",
          mobileTab === "tracks" ? "block" : "hidden",
        )}
      >
        <ScrollArea className="@container h-full w-full">
          <TrackListPane
            key={midiTracks?.instanceKey}
            midiTracks={midiTracks}
            setMidiTracks={setMidiTracks}
            midiFilename={midiTracks?.name}
            onChangeMidiFile={setMidiFile}
          />
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
          <CommonConfigPane
            rendererConfig={rendererConfig}
            onUpdateRendererConfig={onUpdateRendererConfig}
            audioFilename={audioFile?.name}
            onChangeAudioFile={setAudioFile}
            isAudioDecoding={isDecoding}
            onCancelAudioDecode={cancelDecode}
            backgroundImageFilename={backgroundImageFile?.name}
            onChangeBackgroundImage={setBackgroundImageFile}
          />
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
        {VisualizerStyle}
      </GridResizablePanel>

      <GridResizablePanel panelId="about" className="hidden area-[about] md:block md:border-t">
        <FooterPanel onOpenSettings={() => setSettingsTab("general")} />
      </GridResizablePanel>

      <GridResizablePanel
        panelId="settings"
        className={cn("area-[content] md:hidden", mobileTab === "settings" ? "block" : "hidden")}
      >
        <ScrollArea className="h-full w-full px-6 py-4">
          <SettingsContent />
        </ScrollArea>
      </GridResizablePanel>
      <MobileBottomNav
        className="area-[nav] md:hidden"
        value={mobileTab}
        onValueChange={setMobileTab}
      />
      <SettingsDialog tab={settingsTab} onTabChange={setSettingsTab} />
      <Toaster position="top-center" />
      {ConfirmDialog}
    </GridResizablePanelGroup>
  );
}
