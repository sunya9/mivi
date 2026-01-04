import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultRendererConfig,
  RendererConfig,
  RendererType,
} from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";
import { useMemo, useCallback } from "react";
import { MidiTracks } from "../midi/midi";
import { PianoRollConfigPanel } from "@/lib/renderers/piano-roll/piano-roll-config-panel";
import { CometConfigPanel } from "@/lib/renderers/comet/comet-config-panel";
import { FormRow } from "@/components/common/form-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React from "react";

const defaultConfig = getDefaultRendererConfig();

interface RendererOption {
  value: RendererType;
  label: string;
  renderConfig: (
    rendererConfig: RendererConfig,
    onUpdateRendererConfig: (partial: DeepPartial<RendererConfig>) => void,
    midiTracks?: MidiTracks,
  ) => React.ReactNode;
}

const RENDERER_OPTIONS: RendererOption[] = [
  {
    value: "pianoRoll",
    label: "Piano Roll",
    renderConfig: (rendererConfig, onUpdateRendererConfig, midiTracks) => (
      <PianoRollConfigPanel
        pianoRollConfig={rendererConfig.pianoRollConfig}
        onUpdateRendererConfig={onUpdateRendererConfig}
        midiTracks={midiTracks}
      />
    ),
  },
  {
    value: "comet",
    label: "Comet",
    renderConfig: (rendererConfig, onUpdateRendererConfig, midiTracks) => (
      <CometConfigPanel
        cometConfig={rendererConfig.cometConfig}
        onUpdateRendererConfig={onUpdateRendererConfig}
        midiTracks={midiTracks}
      />
    ),
  },
];

export function useRendererConfig(midiTracks?: MidiTracks) {
  const [storedRendererConfig, setRendererConfig] =
    useLocalStorage<RendererConfig>("mivi:renderer-config");
  // add new default config always
  const rendererConfig: RendererConfig = useMemo(
    () => defaultsDeep(storedRendererConfig, defaultConfig) as RendererConfig,
    [storedRendererConfig],
  );
  const onUpdateRendererConfig = useCallback(
    (partial: DeepPartial<RendererConfig>) => {
      const newConfig: RendererConfig = merge(
        { ...rendererConfig },
        { ...partial },
      );
      setRendererConfig(newConfig);
    },
    [rendererConfig, setRendererConfig],
  );

  const selectedRenderer = RENDERER_OPTIONS.find(
    (option) => option.value === rendererConfig.type,
  );
  const renderers = RENDERER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const VisualizerStyle = (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>
          <h2>Visualizer Style</h2>
        </CardTitle>
      </CardHeader>
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
                {renderers.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        {selectedRenderer?.renderConfig(
          rendererConfig,
          onUpdateRendererConfig,
          midiTracks,
        )}
      </CardContent>
    </Card>
  );

  return {
    rendererConfig,
    onUpdateRendererConfig,
    VisualizerStyle,
  };
}
