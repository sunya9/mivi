import { Toaster } from "@/components/ui/sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  return (
    <div
      className="flex flex-1 flex-col md:h-dvh"
      role="application"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {DragDropOverlay}
      <AppHeader
        className="flex-none"
        toggleRecording={toggleRecording}
        recordingState={recordingState}
      />
      <ResizablePanelGroup
        direction="horizontal"
        className="container flex-1 max-md:flex-col!"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel
          defaultSize={33}
          id="track-list-pane"
          className="order-2 max-md:flex-none! md:order-0"
        >
          <ScrollArea type="auto" className="@container h-full w-full">
            <TrackListPane
              midiTracks={midiTracks}
              setMidiTracks={setMidiTracks}
              midiFilename={midiTracks?.name}
              onChangeMidiFile={setMidiFile}
            />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={34}
          id="visualizer-wrapper-pane"
          className="order-1 max-md:flex-none! md:order-0"
        >
          <ResizablePanelGroup
            direction="vertical"
            autoSaveId="center-vertical"
            // workaround for narrow screen
            className="block! md:flex!"
          >
            <ResizablePanel defaultSize={40} id="visualizer-pane" order={1}>
              <MidiVisualizer
                rendererConfig={rendererConfig}
                audioBuffer={audioBuffer}
                midiTracks={midiTracks}
                backgroundImageBitmap={backgroundImageBitmap}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={60} id="common-config-pane" order={2}>
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
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={33}
          id="visualizer-style-pane"
          order={3}
          className="order-3 max-md:flex-none! md:order-0"
        >
          <ScrollArea className="h-full w-full" type="auto">
            {VisualizerStyle}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster position="top-center" />
    </div>
  );
}
