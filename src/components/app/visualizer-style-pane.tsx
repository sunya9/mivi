import { AudioVisualizerConfigPanel } from "@/components/app/audio-visualizer-config-panel";
import { CometConfigPanel } from "@/components/app/comet-config-panel";
import { PianoRollConfigPanel } from "@/components/app/piano-roll-config-panel";
import { VerticalPianoRollConfigPanel } from "@/components/app/vertical-piano-roll-config-panel";
import { SelectRow } from "@/components/common/select-row";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import { useAppContext } from "@/contexts/app-context";
import { useRendererConfig, useUpdateRendererConfig } from "@/hooks/use-renderer-config";
import { useStore } from "@/hooks/use-store";
import { useMessages } from "@/lib/locale/use-messages";
import { RendererType } from "@/lib/renderers/renderer-config";

function useMidiNoteRange() {
  const { midiTracksStore } = useAppContext();
  const minNote = useStore(midiTracksStore, (tracks) => tracks?.minNote);
  const maxNote = useStore(midiTracksStore, (tracks) => tracks?.maxNote);
  return { minNote, maxNote };
}

function PianoRollSection() {
  const pianoRollConfig = useRendererConfig((config) => config.pianoRollConfig);
  return (
    <PianoRollConfigPanel
      pianoRollConfig={pianoRollConfig}
      onUpdateRendererConfig={useUpdateRendererConfig()}
      {...useMidiNoteRange()}
    />
  );
}

function VerticalPianoRollSection() {
  const verticalPianoRollConfig = useRendererConfig((config) => config.verticalPianoRollConfig);
  return (
    <VerticalPianoRollConfigPanel
      verticalPianoRollConfig={verticalPianoRollConfig}
      onUpdateRendererConfig={useUpdateRendererConfig()}
      {...useMidiNoteRange()}
    />
  );
}

function CometSection() {
  const cometConfig = useRendererConfig((config) => config.cometConfig);
  return (
    <CometConfigPanel
      cometConfig={cometConfig}
      onUpdateRendererConfig={useUpdateRendererConfig()}
      {...useMidiNoteRange()}
    />
  );
}

function AudioVisualizerSection() {
  const audioVisualizerConfig = useRendererConfig((config) => config.audioVisualizerConfig);
  return (
    <AudioVisualizerConfigPanel
      audioVisualizerConfig={audioVisualizerConfig}
      onUpdateRendererConfig={useUpdateRendererConfig()}
    />
  );
}

interface RendererOption {
  value: RendererType;
  Section?: () => React.ReactNode;
}

const RENDERER_OPTIONS: RendererOption[] = [
  { value: "none" },
  { value: "pianoRoll", Section: PianoRollSection },
  { value: "verticalPianoRoll", Section: VerticalPianoRollSection },
  { value: "comet", Section: CometSection },
];

export function VisualizerStylePane() {
  const m = useMessages();
  const type = useRendererConfig((config) => config.type);
  const onUpdateRendererConfig = useUpdateRendererConfig();
  const Section = RENDERER_OPTIONS.find((option) => option.value === type)?.Section;
  const rendererLabels: Record<RendererType, string> = {
    none: m.common_none(),
    pianoRoll: m.renderer_piano_roll(),
    verticalPianoRoll: m.renderer_vertical_piano_roll(),
    comet: m.renderer_comet(),
  };
  const rendererItems = RENDERER_OPTIONS.map(({ value }) => ({
    value,
    label: rendererLabels[value],
  }));
  return (
    <Tabs defaultValue="visualizer" className="h-full gap-0 pt-4">
      <TabsList variant="line-indicator" className="mx-6 flex w-auto" aria-label={m.common_style()}>
        <TabsTrigger value="visualizer">{m.style_tab_midi()}</TabsTrigger>
        <TabsTrigger value="audio">{m.style_tab_audio()}</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="visualizer" className="overflow-hidden">
        <ScrollArea className="h-full" orientation="vertical">
          <Card variant="transparent">
            <CardContent className="space-y-4">
              <SelectRow
                label={<span>{m.common_style()}</span>}
                value={type}
                onValueChange={(value) => onUpdateRendererConfig({ type: value ?? undefined })}
                items={rendererItems}
                placeholder={m.style_placeholder()}
                valueClassName="display w-auto"
              >
                <SelectContent align="end">
                  {RENDERER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {rendererLabels[option.value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRow>
              {Section && (
                <>
                  <Separator />
                  <Section />
                </>
              )}
            </CardContent>
          </Card>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="audio" className="overflow-hidden">
        <ScrollArea className="h-full" orientation="vertical">
          <Card variant="transparent">
            <CardContent className="space-y-4">
              <AudioVisualizerSection />
            </CardContent>
          </Card>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
