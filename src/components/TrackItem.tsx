import { MidiTrack } from "@/types/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useUpdateTrackConfig } from "@/atoms/midiTracksAtom";

interface Props {
  track: MidiTrack;
}

export function TrackItem({ track }: Props) {
  const updateTrackConfig = useUpdateTrackConfig();
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between",
        {
          "opacity-70": !track.config.visible,
        },
      )}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <Switch
          checked={track.config.visible}
          onCheckedChange={(checked) =>
            updateTrackConfig(track.id, { visible: checked })
          }
        />
        <span className="flex-1 text-sm font-medium">{track.config.name}</span>
      </label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Scale: {Math.round(track.config.scale * 100)}%
        </span>
        <Slider
          value={[track.config.scale]}
          min={0.5}
          max={1}
          step={0.05}
          defaultValue={[1]}
          onValueChange={([value]) =>
            updateTrackConfig(track.id, { scale: value })
          }
          key={`${track.id}-scale`}
          className="w-16"
        />
        <span className="text-xs text-muted-foreground">
          Opacity: {Math.round(track.config.opacity * 100)}%
        </span>
        <Slider
          value={[track.config.opacity]}
          min={0}
          max={1}
          step={0.05}
          defaultValue={[1]}
          onValueChange={([value]) =>
            updateTrackConfig(track.id, { opacity: value })
          }
          className="w-16"
          key={`${track.id}-opacity`}
        />
        <input
          type="color"
          value={track.config.color}
          onChange={(e) =>
            updateTrackConfig(track.id, { color: e.target.value })
          }
          className="cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}
