import { MidiTrack } from "@/lib/midi/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const id = `${track.id}-visible`;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2 gap-y-2 py-4",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <label
        htmlFor={id}
        className={cn("col-span-2", {
          "text-muted-foreground": !track.config.visible,
        })}
      >
        {track.config.name}
      </label>
      <Switch
        id={id}
        checked={track.config.visible}
        onCheckedChange={(checked) =>
          onUpdateTrackConfig(index, { visible: checked })
        }
        className="col-start-4 justify-self-end"
      />

      {track.config.visible && (
        <>
          <div className="col-span-2 col-start-2 flex flex-row items-center gap-2">
            <span className="text-muted-foreground inline-flex gap-2 text-xs">
              Opacity: {Math.round(track.config.opacity * 100)}%
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
            </span>
          </div>
          <input
            type="color"
            value={track.config.color}
            onChange={(e) =>
              onUpdateTrackConfig(index, { color: e.target.value })
            }
            className="col-start-4 cursor-pointer justify-self-end bg-transparent"
            aria-label="Note color"
          />

          <label className="text-muted-foreground col-start-2 flex items-center gap-1 text-xs">
            <Checkbox
              checked={track.config.staccato}
              onCheckedChange={(checked) =>
                onUpdateTrackConfig(index, { staccato: !!checked })
              }
            />
            Staccato
          </label>
          <div className="col-span-2 col-start-3 flex flex-row items-center gap-2 justify-self-end">
            <span className="text-muted-foreground inline-flex gap-2 text-xs">
              Scale: {Math.round(track.config.scale * 100)}%
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
            </span>
          </div>
        </>
      )}
    </div>
  );
});
