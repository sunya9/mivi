import { Toaster } from "@/components/ui/sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  AppHeader,
  TrackListPane,
  MidiVisualizer,
  VisualizerStyle,
  CommonConfigPane,
} from "@/components/app";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMidi } from "@/lib/midi";
import { useAudio } from "@/lib/audio";
import { useStartRecording } from "@/lib/media-compositor";
import { useRendererConfig } from "@/lib/renderers";

export function App() {
  const { rendererConfig, onUpdateRendererConfig } = useRendererConfig();
  const { setMidiFile, midiTracks, setMidiTracks } = useMidi();
  const { audioFile, setAudioFile, serializedAudio, audioBuffer } = useAudio();
  const { recordingState, toggleRecording } = useStartRecording({
    midiTracks,
    serializedAudio,
    rendererConfig,
  });

  return (
    <div className="flex flex-1 flex-col md:h-dvh">
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
          className="order-2 max-md:flex-none! md:order-none"
        >
          <ScrollArea type="auto" className="@container h-full w-full">
            <TrackListPane
              midiTracks={midiTracks}
              setMidiTracks={setMidiTracks}
            />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={34}
          id="visualizer-wrapper-pane"
          className="order-1 max-md:flex-none! md:order-none"
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
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={60} id="common-config-pane" order={2}>
              <ScrollArea className="h-full w-full" type="auto">
                <CommonConfigPane
                  rendererConfig={rendererConfig}
                  onUpdateRendererConfig={onUpdateRendererConfig}
                  midiFilename={midiTracks?.name}
                  onChangeMidiFile={setMidiFile}
                  audioFilename={audioFile?.name}
                  onChangeAudioFile={setAudioFile}
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
          className="order-3 max-md:flex-none! md:order-none"
        >
          <ScrollArea className="h-full w-full" type="auto">
            <VisualizerStyle
              rendererConfig={rendererConfig}
              onUpdateRendererConfig={onUpdateRendererConfig}
            />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster position="top-center" />
    </div>
  );
}
