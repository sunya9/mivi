import { MidiTrack, TrackSettings } from "../types/midi";

interface Props {
  track: MidiTrack;
  onSettingsChange: (settings: Partial<TrackSettings>) => void;
}

export function TrackItem({ track, onSettingsChange }: Props) {
  return (
    <div className="rounded bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="flex flex-1 items-center gap-2">
          <input
            type="checkbox"
            checked={track.settings.visible}
            onChange={(e) => {
              onSettingsChange({ visible: e.target.checked });
            }}
          />
          <div>{track.settings.name}</div>
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Note count: {track.notes.length}
          <input
            type="color"
            value={track.settings.color}
            onChange={(e) => {
              onSettingsChange({ color: e.target.value });
            }}
            className="ml-auto"
          />
        </div>
      </div>
    </div>
  );
}
