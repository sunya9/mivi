import { MidiVisualizer } from "./MidiVisualizer";
import { AudioHandler } from "@/lib/AudioHandler";
import { MidiState } from "@/types/midi";
import { RendererConfig } from "@/types/renderer";
import { RendererConfigPane } from "@/components/RendererConfigPane";
import { DeepPartial } from "@/types/util";

interface Props {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
  rendererConfig: RendererConfig;
  onRendererConfigChange: (
    config: DeepPartial<RendererConfig>,
    storeConfig?: boolean,
  ) => void;
}

export const RightPane = ({
  midiState,
  audioHandler,
  rendererConfig,
  onRendererConfigChange,
}: Props) => {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-4 flex-1">
        <MidiVisualizer
          audioHandler={audioHandler}
          midiState={midiState}
          rendererConfig={rendererConfig}
          onRendererConfigChange={onRendererConfigChange}
        />
      </div>
      <div className="py-4">
        <div className="space-y-4">
          <div>
            <RendererConfigPane
              config={rendererConfig}
              onChange={onRendererConfigChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
