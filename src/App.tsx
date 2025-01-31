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
import { useMediaQuery } from "@/lib/useMediaQuery";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  const isDesktop = useMediaQuery("md");

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col md:h-dvh">
        <AppHeader className="flex-none" />
        <ResizablePanelGroup
          direction="horizontal"
          // workaround for narrow screen
          className="container block! flex-1 md:flex!"
          autoSaveId="midi-visualizer"
        >
          {isDesktop && (
            <>
              <ResizablePanel defaultSize={33} id="track-list-pane" order={1}>
                <ScrollArea type="auto" className="@container h-full w-full">
                  <TrackListPane />
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}
          <ResizablePanel
            defaultSize={34}
            id="visualizer-wrapper-pane"
            order={1}
          >
            <ResizablePanelGroup
              direction="vertical"
              autoSaveId="center-vertical"
              // workaround for narrow screen
              className="block! md:flex!"
            >
              <ResizablePanel defaultSize={40} id="visualizer-pane" order={1}>
                <MidiVisualizer />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={60}
                id="common-config-pane"
                order={2}
              >
                <ScrollArea className="h-full w-full" type="auto">
                  <CommonConfigPane />
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          {!isDesktop && (
            <>
              <ResizablePanel defaultSize={33} id="track-list-pane" order={2}>
                <ScrollArea type="auto" className="@container h-full w-full">
                  <TrackListPane />
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}
          <ResizablePanel defaultSize={33} id="visualizer-style-pane" order={3}>
            <ScrollArea className="h-full w-full" type="auto">
              <VisualizerStyle />
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
};
