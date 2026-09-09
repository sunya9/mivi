import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { GripVertical } from "lucide-react";
import React from "react";

import { ColorPickerInput } from "@/components/common/color-picker-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MidiTrack } from "@/lib/midi/midi";

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
      className={cn("grid-track-item items-center gap-x-2 py-4", {
        "gap-y-2": track.config.visible,
      })}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground area-[drag] hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <label
        htmlFor={id}
        className={cn("area-[name]", {
          "text-muted-foreground": !track.config.visible,
        })}
      >
        {track.config.name}
      </label>
      <Switch
        id={id}
        checked={track.config.visible}
        onCheckedChange={(checked) => onUpdateTrackConfig(index, { visible: checked })}
        className="justify-self-end area-[switch]"
      />

      {track.config.visible && (
        <>
          <ColorPickerInput
            value={track.config.color}
            onChange={(value) => onUpdateTrackConfig(index, { color: value })}
            className="area-[color]"
            aria-label="Note color"
          />
          <Slider
            label={<>Opacity: {Math.round(track.config.opacity * 100)}%</>}
            labelClassName="text-end text-xs text-muted-foreground tabular-nums area-[opacity-label] @max-[340px]:text-start"
            className="contents"
            controlClassName="w-16 area-[opacity]"
            value={[track.config.opacity]}
            min={0}
            max={1}
            step={0.05}
            defaultValue={[1]}
            onValueChange={([value]) => onUpdateTrackConfig(index, { opacity: value })}
            key={`${track.id}-opacity`}
          />

          <label className="flex items-center gap-1 text-xs text-muted-foreground area-[staccato]">
            <Checkbox
              checked={track.config.staccato}
              onCheckedChange={(checked) => onUpdateTrackConfig(index, { staccato: !!checked })}
            />
            Staccato
          </label>
          <Slider
            label={<>Scale: {Math.round(track.config.scale * 100)}%</>}
            labelClassName="text-end text-xs text-muted-foreground tabular-nums area-[scale-label] @max-[340px]:text-start"
            className="contents"
            controlClassName="w-16 area-[scale]"
            value={[track.config.scale]}
            min={0.5}
            max={1}
            step={0.05}
            defaultValue={[1]}
            onValueChange={([value]) => onUpdateTrackConfig(index, { scale: value })}
            key={`${track.id}-scale`}
          />
        </>
      )}
    </div>
  );
});
