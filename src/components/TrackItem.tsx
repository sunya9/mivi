import { MidiTrack } from "@/types/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useUpdateTrackConfig } from "@/atoms/midiTracksAtom";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  track: MidiTrack;
}

export function TrackItem({ track }: Props) {
  const updateTrackConfig = useUpdateTrackConfig();
  return (
    <div
      className={cn("grid grid-cols-1 gap-2 p-4 @[300px]:grid-cols-2", {
        "opacity-70": !track.config.visible,
      })}
    >
      <label htmlFor={`${track.id}-visible`}>{track.config.name}</label>
      <Switch
        id={`${track.id}-visible`}
        checked={track.config.visible}
        onCheckedChange={(checked) =>
          updateTrackConfig(track.id, { visible: checked })
        }
        className="justify-self-end"
      />

      {track.config.visible && (
        <>
          <div className="flex flex-row items-center gap-2">
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
          </div>
          <input
            type="color"
            value={track.config.color}
            onChange={(e) =>
              updateTrackConfig(track.id, { color: e.target.value })
            }
            className="cursor-pointer justify-self-end bg-transparent"
          />

          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <Checkbox
              checked={track.config.staccato}
              onCheckedChange={(checked) =>
                updateTrackConfig(track.id, { staccato: !!checked })
              }
            />
            Staccato
          </label>

          <div className="flex flex-row items-center gap-2 justify-self-end">
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
          </div>
        </>
      )}
    </div>
  );
}
