import { Checkbox } from "@/components/ui/checkbox";
import { MidiTrack, TrackConfig } from "../types/midi";

interface Props {
  track: MidiTrack;
  onConfigChange: (config: Partial<TrackConfig>) => void;
}

export function TrackItem({ track, onConfigChange }: Props) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <label className="flex flex-1 items-center gap-2">
          <Checkbox
            checked={track.config.visible}
            onCheckedChange={(checked) => {
              onConfigChange({ visible: checked === true });
            }}
          />
          <div>{track.config.name}</div>
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Note count: {track.notes.length}
          <input
            type="color"
            value={track.config.color}
            onChange={(e) => {
              onConfigChange({ color: e.target.value });
            }}
            className="ml-auto"
          />
        </div>
      </div>
    </div>
  );
}
