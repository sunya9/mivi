import { TrackItem } from "./TrackItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CollapsibleCardPane } from "@/components/CollapsibleCardPane";
import { MidiTrack, MidiTracks } from "@/types/midi";
import React, { useCallback } from "react";
import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/tailwindColors";
import { produce } from "immer";

interface Props {
  midiTracks?: MidiTracks;
  setMidiTracks: (midiTracks: MidiTracks) => void;
}
export const TrackListPane = React.memo(
  ({ midiTracks, setMidiTracks }: Props) => {
    const onTrackConfigUpdate = useCallback(
      (trackIndex: number, config: Partial<MidiTrack["config"]>) => {
        if (!midiTracks) return;
        const newMidiTracks = produce(midiTracks, (draft) => {
          draft.tracks[trackIndex].config = {
            ...draft.tracks[trackIndex].config,
            ...config,
          };
        });
        setMidiTracks(newMidiTracks);
      },
      [midiTracks, setMidiTracks],
    );
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CollapsibleCardPane header={<h2>Tracks</h2>}>
          {midiTracks ? (
            <>
              <CardContent>
                <div className="divide-y">
                  {midiTracks.tracks.map((track, i) => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      index={i}
                      onUpdateTrackConfig={onTrackConfigUpdate}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2">
                <div className="flex flex-row flex-wrap items-center justify-start gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setMidiTracks({
                        ...midiTracks,
                        tracks: randomizeColorsColorful(midiTracks.tracks),
                      })
                    }
                  >
                    Randomize colors (colorful)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setMidiTracks({
                        ...midiTracks,
                        tracks: randomizeColorsGradient(midiTracks.tracks),
                      })
                    }
                  >
                    Randomize colors (gradient)
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <p className="text-gray-500">Select a MIDI file</p>
          )}
        </CollapsibleCardPane>
      </Card>
    );
  },
);

function randomizeColorsGradient(midiTracks: MidiTracks["tracks"]) {
  const palette = getRandomTailwindColorPalette();
  return midiTracks.map((track) => ({
    ...track,
    config: {
      ...track.config,
      color: palette(),
    },
  }));
}

function randomizeColorsColorful(midiTracks: MidiTracks["tracks"]) {
  return midiTracks.map((track) => ({
    ...track,
    config: {
      ...track.config,
      color: getRandomTailwindColor(),
    },
  }));
}
