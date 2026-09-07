import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";

import { FileButton } from "@/components/common/file-button";
import { FormRow } from "@/components/common/form-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { hslToHex, generateGoldenAngleHues } from "@/lib/colors/color";
import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/colors/tailwind-colors";
import { MidiTrack, MidiTracks } from "@/lib/midi/midi";
import { useMidi } from "@/lib/midi/use-midi";

import { HueRandomizeDialog } from "./hue-randomize-dialog";
import { TrackItem } from "./track-item";

interface Props {
  midiTracks?: MidiTracks;
  setMidiTracks: Dispatch<SetStateAction<MidiTracks | undefined>>;
  midiFilename?: string;
  onChangeMidiFile: (file: File | undefined) => void;
}

function useRandomizeColorsHue(setMidiTracks: Dispatch<SetStateAction<MidiTracks | undefined>>) {
  return useCallback(
    (saturation: number, lightness: number) => {
      setMidiTracks((midiTracks) => {
        if (!midiTracks) return;
        const hues = generateGoldenAngleHues(midiTracks.tracks.length);
        const newTracks = midiTracks.tracks.map((track, index) => ({
          ...track,
          config: {
            ...track.config,
            color: hslToHex(hues[index], saturation, lightness),
          },
        }));
        return {
          ...midiTracks,
          tracks: newTracks,
        };
      });
    },
    [setMidiTracks],
  );
}

export const TrackListPaneContent = React.memo(function TrackListPaneContent({
  midiTracks,
  setMidiTracks,
  midiFilename,
  onChangeMidiFile,
}: Props) {
  const [hslDialogOpen, setHslDialogOpen] = useState(false);

  const randomizeColorsHue = useRandomizeColorsHue(setMidiTracks);

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

  return (
    <Card variant="transparent">
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
          label="MIDI file"
          placeholder="Choose MIDI file"
          cancelLabel="Cancel MIDI file"
        />
      </CardContent>
      {midiTracks && (
        <CardContent>
          <FormRow
            label="MIDI Offset (s)"
            controller={({ id }) => (
              <NumberField
                id={id}
                value={midiTracks.midiOffset}
                step={0.1}
                onValueChange={(value) => onMidiOffsetChange(value ?? 0)}
              >
                <NumberFieldGroup className="w-32">
                  <NumberFieldDecrement aria-label="Decrease offset" />
                  <NumberFieldInput />
                  <NumberFieldIncrement aria-label="Increase offset" />
                </NumberFieldGroup>
              </NumberField>
            )}
          />
        </CardContent>
      )}
      {midiTracks && (
        <CardContent>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Color preset</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsWhite(midiTracks.tracks),
                    })
                  }
                >
                  All white
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsBlack(midiTracks.tracks),
                    })
                  }
                >
                  All black
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: randomizeColorsColorful(midiTracks.tracks),
                    })
                  }
                >
                  Randomize (colorful)
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: randomizeColorsGradient(midiTracks.tracks),
                    })
                  }
                >
                  Randomize (gradient)
                </MenubarItem>
                <MenubarItem onClick={() => setHslDialogOpen(true)}>Randomize (Hue)...</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Track</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllTracksDisabled(midiTracks.tracks),
                    })
                  }
                >
                  Disable all
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllTracksEnabled(midiTracks.tracks),
                    })
                  }
                >
                  Enable all
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: sortDisabledToBottom(midiTracks.tracks),
                    })
                  }
                >
                  Sort disabled to bottom
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </CardContent>
      )}
      {midiTracks && (
        <CardContent>
          <div className="divide-y">
            <TrackList midiTracks={midiTracks} onUpdateMidiTracks={setMidiTracks} />
          </div>
        </CardContent>
      )}
      {midiTracks && (
        <HueRandomizeDialog
          open={hslDialogOpen}
          onOpenChange={setHslDialogOpen}
          onConfirm={randomizeColorsHue}
        />
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = midiTracks.tracks.findIndex((t) => t.id === active.id);
        const newIndex = midiTracks.tracks.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newTracks = arrayMove(midiTracks.tracks, oldIndex, newIndex);
        onUpdateMidiTracks({
          ...midiTracks,
          tracks: newTracks,
        });
      }
    },
    [midiTracks, onUpdateMidiTracks],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={midiTracks.tracks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {midiTracks.tracks.map((track, i) => (
          <TrackItem
            key={track.id}
            track={track}
            index={i}
            onUpdateTrackConfig={onTrackConfigUpdate}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
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

function setAllTracksDisabled(tracks: MidiTracks["tracks"]) {
  return tracks.map((track) => ({
    ...track,
    config: { ...track.config, visible: false },
  }));
}

function setAllTracksEnabled(tracks: MidiTracks["tracks"]) {
  return tracks.map((track) => ({
    ...track,
    config: { ...track.config, visible: true },
  }));
}

function sortDisabledToBottom(tracks: MidiTracks["tracks"]) {
  const enabled = tracks.filter((t) => t.config.visible);
  const disabled = tracks.filter((t) => !t.config.visible);
  return [...enabled, ...disabled];
}

export function TrackListPane() {
  const { midiTracks, setMidiTracks, setMidiFile } = useMidi();
  return (
    <TrackListPaneContent
      key={midiTracks?.instanceKey}
      midiTracks={midiTracks}
      setMidiTracks={setMidiTracks}
      midiFilename={midiTracks?.name}
      onChangeMidiFile={setMidiFile}
    />
  );
}
