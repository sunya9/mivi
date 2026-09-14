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
import { useMessages } from "@/lib/locale/use-messages";
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
  const m = useMessages();
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
          <h2>{m.tracks_heading()}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <FileButton
          filename={midiFilename}
          setFile={onChangeMidiFile}
          accept=".mid,.midi"
          label={m.midi_file_label()}
          placeholder={m.midi_file_choose()}
          cancelLabel={m.midi_file_cancel()}
        />
      </CardContent>
      {midiTracks && (
        <CardContent>
          <FormRow
            label={m.midi_offset()}
            controller={({ id }) => (
              <NumberField
                id={id}
                value={midiTracks.midiOffset}
                step={0.1}
                onValueChange={(value) => onMidiOffsetChange(value ?? 0)}
              >
                <NumberFieldGroup className="w-32">
                  <NumberFieldDecrement aria-label={m.midi_offset_decrease()} />
                  <NumberFieldInput />
                  <NumberFieldIncrement aria-label={m.midi_offset_increase()} />
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
              <MenubarTrigger>{m.track_menu_color_preset()}</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsWhite(midiTracks.tracks),
                    })
                  }
                >
                  {m.track_menu_all_white()}
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllColorsBlack(midiTracks.tracks),
                    })
                  }
                >
                  {m.track_menu_all_black()}
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
                  {m.track_menu_randomize_colorful()}
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: randomizeColorsGradient(midiTracks.tracks),
                    })
                  }
                >
                  {m.track_menu_randomize_gradient()}
                </MenubarItem>
                <MenubarItem onClick={() => setHslDialogOpen(true)}>
                  {m.track_menu_randomize_hue()}
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>{m.track_menu_track()}</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllTracksDisabled(midiTracks.tracks),
                    })
                  }
                >
                  {m.track_menu_disable_all()}
                </MenubarItem>
                <MenubarItem
                  onClick={() =>
                    setMidiTracks({
                      ...midiTracks,
                      tracks: setAllTracksEnabled(midiTracks.tracks),
                    })
                  }
                >
                  {m.track_menu_enable_all()}
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
                  {m.track_menu_sort_disabled_to_bottom()}
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
