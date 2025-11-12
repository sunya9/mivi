import { TrackItem } from "./track-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CollapsibleCardPane } from "@/components/common/collapsible-card-pane";
import { FileButton } from "@/components/common/file-button";
import { FormRow } from "@/components/common/form-row";
import { MidiTrack, MidiTracks } from "@/lib/midi/midi";
import React, { useCallback, useState } from "react";
import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/colors/tailwind-colors";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Minus, Plus } from "lucide-react";

interface Props {
  midiTracks?: MidiTracks;
  setMidiTracks: (midiTracks: MidiTracks) => void;
  midiFilename?: string;
  onChangeMidiFile: (file: File | undefined) => void;
}
export const TrackListPane = React.memo(function TrackListPane({
  midiTracks,
  setMidiTracks,
  midiFilename,
  onChangeMidiFile,
}: Props) {
  const onTrackConfigUpdate = useCallback(
    (trackIndex: number, config: Partial<MidiTrack["config"]>) => {
      if (!midiTracks) return;

      const newMidiTracks = {
        ...midiTracks,
        tracks: midiTracks.tracks.with(trackIndex, {
          ...midiTracks.tracks[trackIndex],
          config: {
            ...midiTracks.tracks[trackIndex].config,
            ...config,
          },
        }),
      };
      setMidiTracks(newMidiTracks);
    },
    [midiTracks, setMidiTracks],
  );

  const [offsetInputValue, setOffsetInputValue] = useState(
    () => `${midiTracks?.midiOffset || 0}`,
  );

  const onMidiOffsetChange = useCallback(
    (offset: number) => {
      if (!midiTracks) return;
      setMidiTracks({
        ...midiTracks,
        midiOffset: offset,
      });
    },
    [midiTracks, setMidiTracks],
  );

  const handleOffsetInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setOffsetInputValue(value);
      if (value === "") return;
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onMidiOffsetChange(parsed);
      }
    },
    [onMidiOffsetChange],
  );

  const incrementOffset = useCallback(() => {
    if (!midiTracks) return;
    const newOffset = midiTracks.midiOffset + 0.1;
    onMidiOffsetChange(Math.round(newOffset * 10) / 10);
    setOffsetInputValue(String(Math.round(newOffset * 10) / 10));
  }, [midiTracks, onMidiOffsetChange]);

  const decrementOffset = useCallback(() => {
    if (!midiTracks) return;
    const newOffset = midiTracks.midiOffset - 0.1;
    onMidiOffsetChange(Math.round(newOffset * 10) / 10);
    setOffsetInputValue(String(Math.round(newOffset * 10) / 10));
  }, [midiTracks, onMidiOffsetChange]);
  const handleOffsetInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (e.target.value === "" || isNaN(parsed)) {
        setOffsetInputValue("0");
        onMidiOffsetChange(0);
      }
    },
    [onMidiOffsetChange],
  );
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CollapsibleCardPane header={<h2>Tracks</h2>}>
        <CardContent className="grid grid-cols-1 gap-2">
          <FileButton
            filename={midiFilename}
            setFile={onChangeMidiFile}
            accept=".mid,.midi"
            placeholder="Choose MIDI file"
            cancelLabel="Cancel MIDI file"
          />
        </CardContent>
        {midiTracks && (
          <CardContent>
            <FormRow
              label="MIDI Offset (s)"
              controller={({ id }) => (
                <InputGroup className="w-32">
                  <InputGroupAddon align="inline-start">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={decrementOffset}
                      aria-label="Decrease offset"
                    >
                      <Minus />
                    </InputGroupButton>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={id}
                    type="number"
                    className="text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={offsetInputValue}
                    onChange={handleOffsetInputChange}
                    onBlur={handleOffsetInputBlur}
                    step={0.1}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={incrementOffset}
                      aria-label="Increase offset"
                    >
                      <Plus />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              )}
            />
          </CardContent>
        )}
        {midiTracks && (
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
        )}
      </CollapsibleCardPane>
    </Card>
  );
});

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
