import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultRendererConfig,
  RendererConfig,
  RendererType,
} from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import { defaultsDeep, merge } from "lodash-es";
import { useMemo, useCallback } from "react";
import { PianoRollConfigPanel } from "@/components/app/piano-roll-config-panel";
import { CometConfigPanel } from "@/components/app/comet-config-panel";
import { AudioVisualizerConfigPanel } from "@/components/app/audio-visualizer-config-panel";
import { FormRow } from "@/components/common/form-row";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from "@/components/ui/tabs";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    value: "none",
    label: "None",
    renderConfig: () => null,
  },
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
    <Tabs defaultValue="visualizer" className="h-full gap-0 pt-4">
      <TabsList variant="line-indicator" className="mx-6 flex w-auto">
        <TabsTrigger value="visualizer">MIDI Style</TabsTrigger>
        <TabsTrigger value="audio">Audio Style</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent keepMounted value="visualizer" className="overflow-hidden">
        <ScrollArea className="h-full" orientation="vertical">
          <Card variant="transparent">
            <CardContent className="space-y-4">
              <FormRow
                label={<span>Style</span>}
                controller={({ id }) => (
                  <Select
                    value={rendererConfig.type}
                    onValueChange={(value) =>
                      onUpdateRendererConfig({ type: value ?? undefined })
                    }
                    items={renderers}
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
              {selectedRenderer && rendererConfig.type !== "none" && (
                <Separator />
              )}
              {selectedRenderer?.renderConfig(
                rendererConfig,
                onUpdateRendererConfig,
                minNote,
                maxNote,
              )}
            </CardContent>
          </Card>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="audio" className="overflow-hidden" keepMounted>
        <ScrollArea className="h-full" orientation="vertical">
          <Card variant="transparent">
            <CardContent className="space-y-4">
              <AudioVisualizerConfigPanel
                audioVisualizerConfig={rendererConfig.audioVisualizerConfig}
                onUpdateRendererConfig={onUpdateRendererConfig}
              />
            </CardContent>
          </Card>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  return {
    rendererConfig,
    onUpdateRendererConfig,
    VisualizerStyle,
  };
}
