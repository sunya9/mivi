import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/tailwindColors";
import { MidiTracks, MidiTrack, getDefaultTrackConfig } from "@/types/midi";
import { produce } from "immer";
import { atom, useAtom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import defaultsDeep from "lodash.defaultsdeep";
import { useCallback } from "react";

const defaultTrackConfig = getDefaultTrackConfig("");

export const midiTracksStorageAtom = atomWithStorage<MidiTracks | undefined>(
  "mivi:midi-tracks",
  undefined,
);

export const midiTracksAtom = atom<
  MidiTracks | undefined,
  [MidiTracks | undefined],
  void
>(
  (get) => {
    const midiTracks = get(midiTracksStorageAtom);
    if (!midiTracks) return;
    const tracks = midiTracks.tracks.map((track) => {
      const config = defaultsDeep(track.config, defaultTrackConfig);
      return {
        ...track,
        config,
      };
    });
    return {
      ...midiTracks,
      tracks,
    };
  },
  (_, set, midiTracks) => set(midiTracksStorageAtom, midiTracks),
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
