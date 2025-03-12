import { Suspense } from "react";
import { CommonConfigPane } from "./components/CommonConfigPane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "@/components/Loading";
import { Fallback } from "@/components/Fallback";
import { AppHeader } from "@/components/AppHeader";
import { TrackListPane } from "@/components/TrackListPane";
import { MidiVisualizer } from "@/components/MidiVisualizer";
import { VisualizerStyle } from "@/components/VisualizerStyle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMidi } from "@/lib/useMidi";
import { useAudio } from "@/lib/useAudio";
import { useStartRecording } from "@/lib/useStartRecording";
import { useRendererConfig } from "@/lib/useRendererConfig";

export const App = () => {
  const { rendererConfig, onUpdateRendererConfig } = useRendererConfig();
  const {
    setMidiFile,
    midiTracks,
    midiDuration,
    midiFilename,
    setMidiTracks,
    dbMidiFile,
  } = useMidi();
  const {
    audioFile,
    setAudioFile,
    audioDuration,
    serializedAudio,
    audioBuffer,
  } = useAudio();
  const duration = Math.max(midiDuration, audioDuration);
  const { recordingState, toggleRecording } = useStartRecording({
    duration,
    filename: midiFilename,
    midiTracks,
    serializedAudio,
    rendererConfig,
  });

  return (
    <ErrorBoundary fallbackRender={Fallback}>
      <Suspense fallback={<Loading />}>
        <TooltipProvider>
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
                  <ResizablePanel
                    defaultSize={40}
                    id="visualizer-pane"
                    order={1}
                  >
                    <MidiVisualizer
                      rendererConfig={rendererConfig}
                      audioBuffer={audioBuffer}
                      duration={duration}
                      midiTracks={midiTracks}
                    />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel
                    defaultSize={60}
                    id="common-config-pane"
                    order={2}
                  >
                    <ScrollArea className="h-full w-full" type="auto">
                      <CommonConfigPane
                        rendererConfig={rendererConfig}
                        onUpdateRendererConfig={onUpdateRendererConfig}
                        midiFile={dbMidiFile}
                        onChangeMidiFile={setMidiFile}
                        audioFile={audioFile}
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
          </div>
        </TooltipProvider>
      </Suspense>
    </ErrorBoundary>
  );
};
