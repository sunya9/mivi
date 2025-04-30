import { RendererType } from "@/types/renderer";
import { PianoRollConfigPanel } from "./rendererConfig/PianoRollConfig";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormRow } from "@/components/FormRow";
import { Card, CardContent } from "@/components/ui/card";
import { CollapsibleCardPane } from "@/components/CollapsibleCardPane";
import { DeepPartial } from "@/types/util";
import { RendererConfig } from "@/types/renderer";
import React from "react";

interface Props {
  rendererConfig: RendererConfig;
  onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void;
}
export const VisualizerStyle = React.memo(function VisualizerStyle({
  rendererConfig,
  onUpdateRendererConfig,
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
            />
          )}
        </CardContent>
      </CollapsibleCardPane>
    </Card>
  );
});
