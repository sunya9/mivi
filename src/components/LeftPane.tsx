import { MidiState, MidiTrack } from "../types/midi";
import { TrackItem } from "./TrackItem";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleXIcon } from "lucide-react";

interface Props {
  onMidiSelect: (file: File) => void;
  onTrackChange: (track: MidiTrack) => void;
  setAudioFile: (file: File) => void;
  midiState?: MidiState;
  audio?: File;
  onRandomizeColorsColorful: () => void;
  onRandomizeColorsGradient: () => void;
  clearMidi: () => void;
  clearAudio: () => void;
}

export function LeftPane({
  setAudioFile,
  onMidiSelect,
  onTrackChange,
  midiState,
  audio,
  onRandomizeColorsColorful,
  onRandomizeColorsGradient,
  clearMidi,
  clearAudio,
}: Props) {
  const midiInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative min-h-dvh overflow-y-auto p-4 leading-none">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            <h2>MIDI / Audio Settings</h2>
          </CardTitle>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="ml-2 inline-flex items-center">
                {midiState && (
                  <>
                    <Button
                      className="mr-2"
                      variant="icon"
                      size="iconSmall"
                      onClick={clearMidi}
                    >
                      <CircleXIcon />
                    </Button>
                    {midiState.name}
                  </>
                )}
              </span>
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
              <Button
                size="sm"
                variant="default"
                onClick={() => midiInputRef.current?.click()}
              >
                Open MIDI file
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="ml-2 inline-flex items-center">
                {audio && (
                  <>
                    <Button
                      className="mr-2"
                      variant="icon"
                      size="iconSmall"
                      onClick={clearAudio}
                    >
                      <CircleXIcon />
                    </Button>
                    {audio?.name}
                  </>
                )}
              </span>
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
              <Button
                size="sm"
                variant="default"
                onClick={() => audioInputRef.current?.click()}
              >
                Open Audio file
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {midiState?.tracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onChange={(config) => {
                  onTrackChange({
                    ...track,
                    config: {
                      ...track.config,
                      ...config,
                    },
                  });
                }}
              />
            ))}
          </div>
        </CardContent>
        {midiState?.tracks.length && (
          <CardFooter className="gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRandomizeColorsColorful}
            >
              Randomize colors (colorful)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRandomizeColorsGradient}
            >
              Randomize colors (gradient)
            </Button>
          </CardFooter>
        )}
      </Card>
      {midiState?.tracks.length === 0 && (
        <div className="py-4 text-center text-gray-500">Select a MIDI file</div>
      )}
    </div>
  );
}
