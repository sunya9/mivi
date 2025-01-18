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
export const App = () => {
  return (
    <ErrorBoundary fallbackRender={Fallback}>
      <Suspense fallback={<Loading />}>
        <AppInternal />
      </Suspense>
    </ErrorBoundary>
  );
};

const AppInternal = () => {
  return (
    <div className="flex h-dvh flex-1 flex-col">
      <AppHeader className="flex-none" />
      <ResizablePanelGroup
        direction="horizontal"
        className="container flex-1"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel defaultSize={33}>
          <ScrollArea type="auto" className="h-full w-full @container">
            <TrackListPane />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={34}>
          <ResizablePanelGroup
            direction="vertical"
            autoSaveId="center-vertical"
          >
            <ResizablePanel defaultSize={40}>
              <MidiVisualizer />
            </ResizablePanel>
            <ResizableHandle />

            <ResizablePanel defaultSize={60}>
              <ScrollArea className="h-full w-full" type="auto">
                <CommonConfigPane />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={33}>
          <ScrollArea className="h-full w-full" type="auto">
            <VisualizerStyle />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
