import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  GridResizablePanelGroup,
  GridResizablePanel,
  GridResizableSeparator,
} from "@/components/grid-resizable";
import { AppHeader } from "@/components/app/app-header";
import { TrackListPane } from "@/components/app/track-list-pane";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { CommonConfigPane } from "@/components/app/common-config-pane";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMidi } from "@/lib/midi/use-midi";
import { useAudio } from "@/lib/audio/use-audio";
import { useRecorder } from "@/lib/media-compositor/use-recorder";
import { useRendererConfig } from "@/lib/renderers/use-renderer-config";
import { useBackgroundImage } from "./lib/background-image/use-background-image";
import { createRecorderResources } from "./lib/media-compositor/recorder-resources";
import { useDnd } from "@/hooks/use-dnd";
import {
  MobileBottomNav,
  type MobileTabValue,
} from "@/components/app/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useIsMobile } from "./hooks/use-mobile";
import type { GridAreaConfig } from "@/components/grid-resizable";

const desktopGridArea: GridAreaConfig = {
  areas: `
    "track-list sep-h1 visualizer sep-h2 style"
    "track-list sep-h1 sep-v      sep-h2 style"
    "track-list sep-h1 config     sep-h2 style"
  `,
  columns:
    "minmax(0,var(--panel-track-list)) 1px minmax(0,var(--panel-center)) 1px minmax(0,var(--panel-style))",
  rows: "minmax(0,var(--panel-visualizer)) 1px minmax(0,var(--panel-config))",
};

const mobileGridArea: GridAreaConfig = {
  areas: `
    "visualizer"
    "content"
  `,
  columns: "1fr",
  rows: "auto 1fr",
};

export function App() {
  const { setMidiFile, midiTracks, setMidiTracks } = useMidi();
  const { rendererConfig, onUpdateRendererConfig, VisualizerStyle } =
    useRendererConfig(midiTracks);
  const { audioFile, setAudioFile, serializedAudio, audioBuffer } = useAudio();
  const { backgroundImageBitmap, setBackgroundImageFile, backgroundImageFile } =
    useBackgroundImage();
  const recordResources = createRecorderResources({
    midiTracks,
    serializedAudio,
    rendererConfig,
    backgroundImageBitmap,
  });
  const { recordingState, toggleRecording } = useRecorder(recordResources);

  const { handleDrop, handleDragOver, handleDragLeave, DragDropOverlay } =
    useDnd({
      onDropMidi: setMidiFile,
      onDropAudio: setAudioFile,
      onDropImage: setBackgroundImageFile,
    });

  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTabValue>("visualizer");

  return (
    <div
      className="grid max-h-dvh min-h-dvh grid-rows-[auto_1fr_auto] overflow-hidden md:grid-rows-[auto_1fr]"
      role="application"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {DragDropOverlay}
      <AppHeader
        toggleRecording={toggleRecording}
        recordingState={recordingState}
      />
      <GridResizablePanelGroup
        id="main-layout"
        panels={[
          { id: "track-list", defaultSize: 1, constraints: { minSize: 0.3 } },
          { id: "center", defaultSize: 1 },
          { id: "visualizer", defaultSize: 1 },
          { id: "config", defaultSize: 1.5 },
          { id: "style", defaultSize: 1, constraints: { minSize: 0.3 } },
        ]}
        gridArea={desktopGridArea}
        mobileGridArea={mobileGridArea}
        isMobile={isMobile}
        className="mx-auto min-h-0 max-w-384"
      >
        <GridResizablePanel
          id="visualizer"
          area="visualizer"
          className={cn({ "max-h-[calc(100dvh/3)]": isMobile })}
        >
          <MidiVisualizer
            rendererConfig={rendererConfig}
            audioBuffer={audioBuffer}
            midiTracks={midiTracks}
            backgroundImageBitmap={backgroundImageBitmap}
          />
        </GridResizablePanel>
        <GridResizablePanel
          id="track-list"
          area={isMobile ? "content" : "track-list"}
          className={cn({ hidden: isMobile && mobileTab !== "tracks" })}
        >
          <ScrollArea type="auto" className="@container h-full w-full">
            <TrackListPane
              key={midiTracks?.hash}
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
          controls={["track-list", "center"]}
          area="sep-h1"
        />

        <GridResizableSeparator
          id="sep-v"
          orientation="vertical"
          controls={["visualizer", "config"]}
          area="sep-v"
        />

        <GridResizablePanel
          id="config"
          area={isMobile ? "content" : "config"}
          className={cn({
            hidden: isMobile && mobileTab !== "visualizer",
          })}
        >
          <ScrollArea className="h-full w-full" type="auto">
            <CommonConfigPane
              rendererConfig={rendererConfig}
              onUpdateRendererConfig={onUpdateRendererConfig}
              audioFilename={audioFile?.name}
              onChangeAudioFile={setAudioFile}
              backgroundImageFilename={backgroundImageFile?.name}
              onChangeBackgroundImage={setBackgroundImageFile}
            />
          </ScrollArea>
        </GridResizablePanel>

        <GridResizableSeparator
          id="sep-h2"
          orientation="horizontal"
          controls={["center", "style"]}
          area="sep-h2"
        />

        <GridResizablePanel
          id="style"
          area={isMobile ? "content" : "style"}
          className={cn({ hidden: isMobile && mobileTab !== "style" })}
        >
          <ScrollArea className="h-full w-full" type="auto">
            {VisualizerStyle}
          </ScrollArea>
        </GridResizablePanel>
      </GridResizablePanelGroup>

      <MobileBottomNav
        className="flex-none md:hidden"
        value={mobileTab}
        onValueChange={setMobileTab}
      />
      <Toaster position="top-center" />
    </div>
  );
}
