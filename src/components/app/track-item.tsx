import { MidiTrack } from "@/lib/midi/midi";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPickerInput } from "@/components/common/color-picker-input";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  track: MidiTrack;
  index: number;
  onUpdateTrackConfig: (index: number, config: Partial<MidiTrack["config"]>) => void;
}

export const TrackItem = React.memo(function TrackItem({
  track,
  onUpdateTrackConfig,
  index,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  });

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
      className={cn("grid grid-cols-[auto_1fr_auto_48px] items-center gap-x-2 gap-y-2 py-4")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
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
        onCheckedChange={(checked) => onUpdateTrackConfig(index, { visible: checked })}
        className="col-start-4 justify-self-end"
      />

      {track.config.visible && (
        <>
          <ColorPickerInput
            value={track.config.color}
            onChange={(value) => onUpdateTrackConfig(index, { color: value })}
            className="col-start-2"
            aria-label="Note color"
          />
          <div className="text-end text-xs text-muted-foreground tabular-nums">
            Opacity: {Math.round(track.config.opacity * 100)}%
          </div>
          <Slider
            value={[track.config.opacity]}
            min={0}
            max={1}
            step={0.05}
            defaultValue={[1]}
            onValueChange={([value]) => onUpdateTrackConfig(index, { opacity: value })}
            className="w-16"
            key={`${track.id}-opacity`}
            aria-label="Opacity"
          />

          <label className="col-start-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Checkbox
              checked={track.config.staccato}
              onCheckedChange={(checked) => onUpdateTrackConfig(index, { staccato: !!checked })}
            />
            Staccato
          </label>
          <div className="text-end text-xs text-muted-foreground tabular-nums">
            Scale: {Math.round(track.config.scale * 100)}%
          </div>
          <Slider
            value={[track.config.scale]}
            min={0.5}
            max={1}
            step={0.05}
            defaultValue={[1]}
            onValueChange={([value]) => onUpdateTrackConfig(index, { scale: value })}
            aria-label="Scale"
            key={`${track.id}-scale`}
            className="col-start-4 basis-16"
          />
        </>
      )}
    </div>
  );
});
