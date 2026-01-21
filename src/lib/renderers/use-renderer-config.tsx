import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultRendererConfig,
  RendererConfig,
  RendererType,
} from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { defaultsDeep, merge } from "lodash-es";
import { useMemo, useCallback } from "react";
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
    minNote?: number,
    maxNote?: number,
  ) => React.ReactNode;
}

const RENDERER_OPTIONS: RendererOption[] = [
  {
    value: "pianoRoll",
    label: "Piano Roll",
    renderConfig: (
      rendererConfig,
      onUpdateRendererConfig,
      minNote,
      maxNote,
    ) => (
      <PianoRollConfigPanel
        pianoRollConfig={rendererConfig.pianoRollConfig}
        onUpdateRendererConfig={onUpdateRendererConfig}
        minNote={minNote}
        maxNote={maxNote}
      />
    ),
  },
  {
    value: "comet",
    label: "Comet",
    renderConfig: (
      rendererConfig,
      onUpdateRendererConfig,
      minNote,
      maxNote,
    ) => (
      <CometConfigPanel
        cometConfig={rendererConfig.cometConfig}
        onUpdateRendererConfig={onUpdateRendererConfig}
        minNote={minNote}
        maxNote={maxNote}
      />
    ),
  },
];

export function useRendererConfig(minNote?: number, maxNote?: number) {
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
      <CardContent className="space-y-4">
        <FormRow
          label={<span>Style</span>}
          controller={({ id }) => (
            <Select
              value={rendererConfig.type}
              onValueChange={(value: RendererType) =>
                onUpdateRendererConfig({ type: value })
              }
            >
              <SelectTrigger id={id}>
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
          )}
        />
        {selectedRenderer?.renderConfig(
          rendererConfig,
          onUpdateRendererConfig,
          minNote,
          maxNote,
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
