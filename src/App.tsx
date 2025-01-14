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
import { AppToolbar } from "@/components/AppToolbar";
import { DevTools } from "jotai-devtools";
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
      <DevTools />
    </ErrorBoundary>
  );
};

const AppInternal = () => {
  return (
    <div className="container flex min-h-dvh flex-1 flex-col">
      <div className="my-4 items-baseline gap-2 sm:inline-flex">
        <h1 className="text-7xl font-bold">MiVi</h1>
        <p className="-mt-2 text-xl font-medium text-muted-foreground sm:mt-0">
          <span className="text-accent-foreground">MI</span>DI{" "}
          <span className="text-accent-foreground">Vi</span>sualizer
        </p>
      </div>
      <AppToolbar />
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel defaultSize={33}>
          <ScrollArea type="auto" className="h-full w-full">
            <TrackListPane />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />
        <ResizablePanel defaultSize={34}>
          <ResizablePanelGroup
            direction="vertical"
            autoSaveId="center-vertical"
          >
            <ResizablePanel defaultSize={40}>
              <MidiVisualizer />
            </ResizablePanel>
            <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />

            <ResizablePanel defaultSize={60}>
              <ScrollArea type="auto" className="h-full w-full">
                <CommonConfigPane />
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />
        <ResizablePanel defaultSize={33}>
          <ScrollArea type="auto" className="h-full w-full">
            <VisualizerStyle />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
