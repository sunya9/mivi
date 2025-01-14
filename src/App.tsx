import { Suspense } from "react";
import { LeftPane } from "./components/LeftPane";
import { RightPane } from "./components/RightPane";
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
    <div className="container">
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
        className="flex h-screen"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel defaultSize={40} className="bg-gray-50">
          <LeftPane />
        </ResizablePanel>
        <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />
        <ResizablePanel defaultSize={60}>
          <RightPane />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
