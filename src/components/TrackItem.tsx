import { MidiTrack } from "@/types/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

interface Props {
  track: MidiTrack;
  index: number;
  onUpdateTrackConfig: (
    index: number,
    config: Partial<MidiTrack["config"]>,
  ) => void;
}

export const TrackItem = React.memo(function TrackItem({
  track,
  onUpdateTrackConfig,
  index,
}: Props) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-2 py-4 @[300px]:grid-cols-2", {
        "opacity-70": !track.config.visible,
      })}
    >
      <label htmlFor={`${track.id}-visible`}>{track.config.name}</label>
      <Switch
        id={`${track.id}-visible`}
        checked={track.config.visible}
        onCheckedChange={(checked) =>
          onUpdateTrackConfig(index, { visible: checked })
        }
        className="justify-self-end"
      />

      {track.config.visible && (
        <>
          <div className="flex flex-row items-center gap-2">
            <span className="text-muted-foreground text-xs">
              Opacity: {Math.round(track.config.opacity * 100)}%
            </span>
            <Slider
              value={[track.config.opacity]}
              min={0}
              max={1}
              step={0.05}
              defaultValue={[1]}
              onValueChange={([value]) =>
                onUpdateTrackConfig(index, { opacity: value })
              }
              className="w-16"
              key={`${track.id}-opacity`}
              aria-label="Opacity"
            />
          </div>
          <input
            type="color"
            value={track.config.color}
            onChange={(e) =>
              onUpdateTrackConfig(index, { color: e.target.value })
            }
            className="cursor-pointer justify-self-end bg-transparent"
          />

          <label className="text-muted-foreground flex items-center gap-1 text-xs">
            <Checkbox
              checked={track.config.staccato}
              onCheckedChange={(checked) =>
                onUpdateTrackConfig(index, { staccato: !!checked })
              }
            />
            Staccato
          </label>

          <div className="flex flex-row items-center gap-2 justify-self-end">
            <span className="text-muted-foreground text-xs">
              Scale: {Math.round(track.config.scale * 100)}%
            </span>
            <Slider
              value={[track.config.scale]}
              min={0.5}
              max={1}
              step={0.05}
              defaultValue={[1]}
              onValueChange={([value]) =>
                onUpdateTrackConfig(index, { scale: value })
              }
              aria-label="Scale"
              key={`${track.id}-scale`}
              className="w-16"
            />
          </div>
        </>
      )}
    </div>
  );
});
