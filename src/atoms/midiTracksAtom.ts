import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/tailwindColors";
import { MidiTracks, MidiTrack } from "@/types/midi";
import { produce } from "immer";
import { useAtom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";

export const midiTracksAtom = atomWithStorage<MidiTracks | undefined>(
  "mivi:midi-tracks",
  undefined,
);

export const useRandomizeColorsColorful = () => {
  const setMidiState = useSetAtom(midiTracksAtom);
  const randomizeColorsColorful = useCallback(
    (midiState: MidiTracks) => {
      const newMidiState = produce(midiState, (draft) => {
        if (!draft?.tracks) return;
        draft.tracks = draft?.tracks.map((track) => ({
          ...track,
          config: {
            ...track.config,
            color: getRandomTailwindColor(),
          },
        }));
      });
      setMidiState(newMidiState);
    },
    [setMidiState],
  );
  return randomizeColorsColorful;
};

export const useRandomizeColorsGradient = () => {
  const setMidiState = useSetAtom(midiTracksAtom);
  const randomizeColorsGradient = useCallback(
    (midiState: MidiTracks) => {
      const newMidiState = produce(midiState, (draft) => {
        const palette = getRandomTailwindColorPalette();
        draft.tracks = draft.tracks.map((track) => ({
          ...track,
          config: {
            ...track.config,
            color: palette(),
          },
        }));
      });
      setMidiState(newMidiState);
    },
    [setMidiState],
  );
  return randomizeColorsGradient;
};

export const useUpdateTrackConfig = () => {
  const [midiState, setMidiState] = useAtom(midiTracksAtom);
  const updateTrackConfig = useCallback(
    (trackId: string, config: Partial<MidiTrack["config"]>) => {
      const newMidiState = produce(midiState, (draft) => {
        const track = draft?.tracks.find((t) => t.id === trackId);
        if (track) {
          track.config = { ...track.config, ...config };
        }
      });
      setMidiState(newMidiState);
    },
    [midiState, setMidiState],
  );
  return updateTrackConfig;
};
