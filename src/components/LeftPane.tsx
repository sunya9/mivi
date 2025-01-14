import { TrackItem } from "./TrackItem";
import { startTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleXIcon } from "lucide-react";
import { midiAtom, midiFileAtom } from "@/atoms/midiAtom";
import { audioFileAtom, audioInfoAtom } from "@/atoms/playerAtom";
import {
  midiTracksAtom,
  useRandomizeColorsColorful,
  useRandomizeColorsGradient,
} from "@/atoms/midiTracksAtom";
import { useAtomValue, useSetAtom } from "jotai";

export function LeftPane() {
  const midi = useAtomValue(midiFileAtom);
  const setMidi = useSetAtom(midiAtom);
  const midiTracks = useAtomValue(midiTracksAtom);
  const randomizeColorsColorful = useRandomizeColorsColorful();
  const randomizeColorsGradient = useRandomizeColorsGradient();
  const audio = useAtomValue(audioFileAtom);
  const setAudio = useSetAtom(audioInfoAtom);
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
                {midi && (
                  <>
                    <Button
                      className="mr-2"
                      variant="icon"
                      size="iconSmall"
                      onClick={() =>
                        startTransition(async () => {
                          await setMidi(undefined);
                        })
                      }
                    >
                      <CircleXIcon />
                    </Button>
                    {midi.name}
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
                  startTransition(async () => {
                    await setMidi(file);
                  });
                  e.currentTarget.value = "";
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
                      onClick={() =>
                        startTransition(async () => {
                          await setAudio(undefined);
                        })
                      }
                    >
                      <CircleXIcon />
                    </Button>
                    {audio.name}
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
                  startTransition(async () => {
                    await setAudio(file);
                  });
                  e.currentTarget.value = "";
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
        {midiTracks && (
          <>
            <CardContent>
              <div className="divide-y">
                {midiTracks.tracks.map((track) => (
                  <TrackItem key={track.id} track={track} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => randomizeColorsColorful(midiTracks)}
              >
                Randomize colors (colorful)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => randomizeColorsGradient(midiTracks)}
              >
                Randomize colors (gradient)
              </Button>
            </CardFooter>
          </>
        )}
        {!midiTracks?.tracks.length && (
          <CardFooter>
            <p className="text-center text-gray-500">Select a MIDI file</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
