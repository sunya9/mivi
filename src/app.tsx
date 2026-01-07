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
import { AboutPanel } from "@/components/app/about-panel";
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

export function App() {
  const { setMidiFile, midiTracks, setMidiTracks, ConfirmDialog } = useMidi();
  const { rendererConfig, onUpdateRendererConfig, VisualizerStyle } =
    useRendererConfig(midiTracks?.minNote, midiTracks?.maxNote);
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
        className="grid-main-layout mx-auto min-h-0 max-w-384"
      >
        <GridResizablePanel
          panelId="visualizer"
          className={cn(
            "area-[visualizer] max-h-[calc(100dvh/3)] md:max-h-none",
            { "hidden md:block": mobileTab === "about" },
          )}
        >
          <MidiVisualizer
            rendererConfig={rendererConfig}
            audioBuffer={audioBuffer}
            midiTracks={midiTracks}
            backgroundImageBitmap={backgroundImageBitmap}
          />
        </GridResizablePanel>
        <GridResizablePanel
          panelId="track-list"
          className={cn(
            "area-[content] md:area-[track-list] md:block",
            mobileTab === "tracks" ? "block" : "hidden",
          )}
        >
          <ScrollArea type="auto" className="@container h-full w-full">
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
          controls={["track-list", "center"]}
          className="area-[sep-h1]"
        />

        <GridResizableSeparator
          id="sep-v"
          orientation="vertical"
          controls={["visualizer", "config"]}
          className="area-[sep-v]"
        />

        <GridResizablePanel
          panelId="config"
          className={cn(
            "area-[content] md:area-[config] md:block",
            mobileTab === "visualizer" ? "block" : "hidden",
          )}
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
          className="area-[sep-h2]"
        />

        <GridResizablePanel
          panelId="style"
          className={cn(
            "area-[content] md:area-[style] md:block",
            mobileTab === "style" ? "block" : "hidden",
          )}
        >
          <ScrollArea className="h-full w-full" type="auto">
            {VisualizerStyle}
          </ScrollArea>
        </GridResizablePanel>

        <GridResizablePanel
          panelId="about"
          className={cn(
            "area-[content] md:area-[about] md:block",
            mobileTab === "about" ? "block" : "hidden",
            "md:-mx-[calc((100dvw-min(100dvw,--spacing(384)))/2)] md:border-t md:shadow",
          )}
          asChild
        >
          <AboutPanel />
        </GridResizablePanel>
      </GridResizablePanelGroup>

      <MobileBottomNav
        className="flex-none md:hidden"
        value={mobileTab}
        onValueChange={setMobileTab}
      />
      <Toaster position="top-center" />
      {ConfirmDialog}
    </div>
  );
}
