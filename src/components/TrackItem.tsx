import { MidiTrack } from "@/types/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  track: MidiTrack;
  onChange: (config: Partial<MidiTrack["config"]>) => void;
}

export function TrackItem({ track, onChange }: Props) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4", {
        "opacity-70": !track.config.visible,
      })}
    >
      <div className="flex items-center gap-2">
        <Switch
          checked={track.config.visible}
          onCheckedChange={(checked) => onChange({ visible: checked })}
        />
        <input
          type="color"
          value={track.config.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
        />
        <span className="flex-1 text-sm font-medium">{track.config.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Opacity:</span>
        <Slider
          value={[track.config.opacity]}
          min={0}
          max={1}
          step={0.05}
          defaultValue={[1]}
          onValueChange={([value]) => onChange({ opacity: value })}
          className="flex-1"
        />
        <span className="w-8 text-right text-xs text-muted-foreground">
          {Math.round(track.config.opacity * 100)}%
        </span>
      </div>
    </div>
  );
}
