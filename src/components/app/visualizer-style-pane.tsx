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
import {
  useRendererConfig,
  useRendererSection,
  useUpdateRendererConfig,
} from "@/hooks/use-renderer-config";
import { useStore } from "@/hooks/use-store";
import { RendererType } from "@/lib/renderers/renderer-config";

function useMidiNoteRange() {
  const { midiTracksStore } = useAppContext();
  const minNote = useStore(midiTracksStore, (tracks) => tracks?.minNote);
  const maxNote = useStore(midiTracksStore, (tracks) => tracks?.maxNote);
  return { minNote, maxNote };
}

function PianoRollSection() {
  const [config, onChange] = useRendererSection("pianoRollConfig");
  return <PianoRollConfigPanel config={config} onChange={onChange} {...useMidiNoteRange()} />;
}

function VerticalPianoRollSection() {
  const [config, onChange] = useRendererSection("verticalPianoRollConfig");
  return (
    <VerticalPianoRollConfigPanel config={config} onChange={onChange} {...useMidiNoteRange()} />
  );
}

function CometSection() {
  const [config, onChange] = useRendererSection("cometConfig");
  return <CometConfigPanel config={config} onChange={onChange} {...useMidiNoteRange()} />;
}

function AudioVisualizerSection() {
  const [config, onChange] = useRendererSection("audioVisualizerConfig");
  return <AudioVisualizerConfigPanel config={config} onChange={onChange} />;
}

interface RendererOption {
  value: RendererType;
  label: string;
  Section?: () => React.ReactNode;
}

const RENDERER_OPTIONS: RendererOption[] = [
  { value: "none", label: "None" },
  { value: "pianoRoll", label: "Piano Roll", Section: PianoRollSection },
  { value: "verticalPianoRoll", label: "Vertical Piano Roll", Section: VerticalPianoRollSection },
  { value: "comet", label: "Comet", Section: CometSection },
];

export function VisualizerStylePane() {
  const type = useRendererConfig((config) => config.type);
  const onUpdateRendererConfig = useUpdateRendererConfig();
  const Section = RENDERER_OPTIONS.find((option) => option.value === type)?.Section;
  return (
    <Tabs defaultValue="visualizer" className="h-full gap-0 pt-4">
      <TabsList variant="line-indicator" className="mx-6 flex w-auto" aria-label="Style">
        <TabsTrigger value="visualizer">MIDI Style</TabsTrigger>
        <TabsTrigger value="audio">Audio Style</TabsTrigger>
        <TabsIndicator />
      </TabsList>
      <TabsContent value="visualizer" className="overflow-hidden">
        <ScrollArea className="h-full" orientation="vertical">
          <Card variant="transparent">
            <CardContent className="space-y-4">
              <SelectRow
                label={<span>Style</span>}
                value={type}
                onValueChange={(value) => {
                  if (value == null) return;
                  onUpdateRendererConfig({ type: value });
                }}
                items={RENDERER_OPTIONS}
                placeholder="Select visualization style"
                valueClassName="display w-auto"
              >
                <SelectContent align="end">
                  {RENDERER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
