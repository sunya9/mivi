import { TrackItem } from "./TrackItem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  midiTracksAtom,
  useRandomizeColorsColorful,
  useRandomizeColorsGradient,
} from "@/atoms/midiTracksAtom";
import { useAtomValue } from "jotai";
import { Separator } from "@/components/ui/separator";

export const TrackListPane = () => {
  const midiTracks = useAtomValue(midiTracksAtom);
  const randomizeColorsColorful = useRandomizeColorsColorful();
  const randomizeColorsGradient = useRandomizeColorsGradient();
  if (!midiTracks) return;
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Tracks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {midiTracks.tracks.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex flex-row items-center justify-start gap-2">
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
        </div>
        {!midiTracks?.tracks.length && (
          <>
            <Separator />
            <p className="text-center text-gray-500">Select a MIDI file</p>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
