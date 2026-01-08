import { TrackItem } from "./track-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Minus, Plus } from "lucide-react";

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
      <CardHeader>
        <CardTitle>
          <h2>Tracks</h2>
        </CardTitle>
      </CardHeader>
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
              <TrackList
                midiTracks={midiTracks}
                onUpdateMidiTracks={setMidiTracks}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  Color presets
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsWhite(midiTracks.tracks),
                    })
                  }
                >
                  All white
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsBlack(midiTracks.tracks),
                    })
                  }
                >
                  All black
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: randomizeColorsColorful(midiTracks.tracks),
                    })
                  }
                >
                  Randomize (colorful)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: randomizeColorsGradient(midiTracks.tracks),
                    })
                  }
                >
                  Randomize (gradient)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </>
      )}
    </Card>
  );
});

const TrackList = React.memo(function TrackList({
  midiTracks,
  onUpdateMidiTracks,
}: {
  midiTracks: MidiTracks;
  onUpdateMidiTracks: (midiTracks: MidiTracks) => void;
}) {
  const onTrackConfigUpdate = useCallback(
    (trackIndex: number, config: Partial<MidiTrack["config"]>) => {
      const newTracks = midiTracks.tracks.with(trackIndex, {
        ...midiTracks.tracks[trackIndex],
        config: {
          ...midiTracks.tracks[trackIndex].config,
          ...config,
        },
      });
      onUpdateMidiTracks({
        ...midiTracks,
        tracks: newTracks,
      });
    },
    [midiTracks, onUpdateMidiTracks],
  );
  return midiTracks.tracks.map((track, i) => (
    <TrackItem
      key={track.id}
      track={track}
      index={i}
      onUpdateTrackConfig={onTrackConfigUpdate}
    />
  ));
});

function setAllColorsWhite(midiTracks: MidiTracks["tracks"]) {
  return midiTracks.map((track) => ({
    ...track,
    config: {
      ...track.config,
      color: "#ffffff",
    },
  }));
}

function setAllColorsBlack(midiTracks: MidiTracks["tracks"]) {
  return midiTracks.map((track) => ({
    ...track,
    config: {
      ...track.config,
      color: "#000000",
    },
  }));
}

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
