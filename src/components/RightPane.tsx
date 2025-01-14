import { MidiVisualizer } from "./MidiVisualizer";
import { RendererConfigPane } from "@/components/RendererConfigPane";

export const RightPane = () => {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-4 flex-1">
        <MidiVisualizer />
      </div>
      <div className="py-4">
        <div className="space-y-4">
          <div>
            <RendererConfigPane />
          </div>
        </div>
      </div>
    </div>
  );
};
