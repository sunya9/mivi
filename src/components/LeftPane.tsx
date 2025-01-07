import { MidiState, MidiTrack } from "../types/midi";
import { TrackItem } from "./TrackItem";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onMidiSelect: (file: File) => void;
  onTrackChange: (track: MidiTrack) => void;
  setAudioFile: (file: File) => void;
  midiState?: MidiState;
  audio?: File;
}

export function LeftPane({
  setAudioFile,
  onMidiSelect,
  onTrackChange,
  midiState,
  audio,
}: Props) {
  const midiInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative min-h-dvh overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
      <h1 className="mb-4 text-xl font-bold">MIDI visualizer</h1>

      <div className="space-y-2">
        <div>
          <input
            type="file"
            accept=".mid,.midi"
            onChange={async (e) => {
              e.preventDefault();
              const file = e.target.files?.[0];
              if (!file) return;
              onMidiSelect(file);
            }}
            ref={midiInputRef}
            className="hidden"
          />
          <Button onClick={() => midiInputRef.current?.click()}>
            Open MIDI file
          </Button>
          <span className="ml-2">{midiState?.name}</span>
        </div>
        <div>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              e.preventDefault();
              const file = e.target.files?.[0];
              if (!file) return;
              setAudioFile(file);
            }}
            className="hidden"
            ref={audioInputRef}
          />
          <Button onClick={() => audioInputRef.current?.click()}>
            Open Audio file
          </Button>
          {audio && <span className="ml-2">{audio.name}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {midiState?.tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            onSettingsChange={(settings) => {
              onTrackChange({
                ...track,
                settings: {
                  ...track.settings,
                  ...settings,
                },
              });
            }}
          />
        ))}
      </div>

      {midiState?.tracks.length === 0 && (
        <div className="py-4 text-center text-gray-500">Select a MIDI file</div>
      )}
    </div>
  );
}
