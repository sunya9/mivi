import { RendererType } from "@/lib/renderers/renderer";
import { PianoRollConfigPanel } from "./renderer-config/piano-roll-config";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormRow } from "@/components/common/form-row";
import { Card, CardContent } from "@/components/ui/card";
import { CollapsibleCardPane } from "@/components/common/collapsible-card-pane";
import { DeepPartial } from "@/lib/type-utils";
import { RendererConfig } from "@/lib/renderers/renderer";
import React from "react";
import { MidiTracks } from "@/lib/midi/midi";
interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
  midiTracks?: MidiTracks;
}
export const VisualizerStyle = React.memo(function VisualizerStyle({
  rendererConfig,
  onUpdateRendererConfig,
  midiTracks,
}: Props) {
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CollapsibleCardPane header={<h2>Visualizer Style</h2>}>
        <CardContent>
          <FormRow
            label={<span>Style</span>}
            controller={
              <Select
                value={rendererConfig.type}
                onValueChange={(value: RendererType) =>
                  onUpdateRendererConfig({ type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    className="display w-auto"
                    placeholder="Select visualization style"
                  />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="pianoRoll">Piano Roll</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          {rendererConfig.type === "pianoRoll" && (
            <PianoRollConfigPanel
              pianoRollConfig={rendererConfig.pianoRollConfig}
              onUpdateRendererConfig={onUpdateRendererConfig}
              midiTracks={midiTracks}
            />
          )}
        </CardContent>
      </CollapsibleCardPane>
    </Card>
  );
});
