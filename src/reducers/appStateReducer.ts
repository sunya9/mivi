import { useCallback, useReducer } from "react";
import { MidiState, MidiTrack } from "../types/midi";
import { AudioHandler } from "@/lib/AudioHandler";
import { RendererConfig } from "@/types/renderer";
import { produce } from "immer";
import {
  getRandomTailwindColor,
  getRandomTailwindColorPalette,
} from "@/lib/tailwindColors";
import { FileStorage } from "@/lib/FileStorage";

type AppStateAction =
  | {
      type: "UPDATE_MIDI";
      payload: MidiState | undefined;
    }
  | {
      type: "SET_AUDIO_HANDLER";
      payload: AudioHandler | undefined;
    }
  | {
      type: "UPDATE_RENDERER_CONFIG";
      payload: RendererConfig;
    };

interface AppState {
  midiState?: MidiState;
  audioHandler?: AudioHandler;
  rendererConfig: RendererConfig;
}

export function appStateReducer(
  state: AppState,
  action: AppStateAction,
): AppState {
  switch (action.type) {
    case "UPDATE_MIDI":
      if (!action.payload)
        return {
          ...state,
          midiState: undefined,
        };
      return {
        ...state,
        midiState: { ...action.payload },
      };
    case "SET_AUDIO_HANDLER":
      return {
        ...state,
        audioHandler: action.payload,
      };
    case "UPDATE_RENDERER_CONFIG":
      return {
        ...state,
        rendererConfig: action.payload,
      };
    default:
      return state;
  }
}

export const useAppStateReducer = (
  fileStorage: FileStorage,
  rendererConfig: RendererConfig,
  audioHandler?: AudioHandler,
  midiState?: MidiState,
) => {
  const [appState, dispatch] = useReducer(appStateReducer, {
    midiState,
    audioHandler,
    rendererConfig,
  });
  const updateMidi = (midi: MidiState) =>
    dispatch({ type: "UPDATE_MIDI", payload: midi });
  const updateTrackConfig = useCallback(
    (
      trackId: string,
      config: Partial<MidiTrack["config"]>,
      midiState?: MidiState,
    ) => {
      if (!midiState) return;
      const newMidiState = produce(midiState, (draft) => {
        const track = draft?.tracks.find((t) => t.id === trackId);
        if (track) {
          track.config = { ...track.config, ...config };
        }
      });
      dispatch({ type: "UPDATE_MIDI", payload: newMidiState });
      return newMidiState;
    },
    [],
  );
  const setAudioHandler = (audioHandler: AudioHandler) =>
    dispatch({ type: "SET_AUDIO_HANDLER", payload: audioHandler });
  const updateRendererConfig = (config: RendererConfig) => {
    dispatch({ type: "UPDATE_RENDERER_CONFIG", payload: config });
  };
  const randomizeColorsColorful = useCallback(async () => {
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
    dispatch({ type: "UPDATE_MIDI", payload: newMidiState });
    await fileStorage.storeData({ midi: newMidiState });
  }, [fileStorage, midiState]);
  const randomizeColorsGradient = useCallback(async () => {
    const newMidiState = produce(midiState, (draft) => {
      if (!draft?.tracks) return;
      const palette = getRandomTailwindColorPalette();
      draft.tracks = draft.tracks.map((track) => ({
        ...track,
        config: {
          ...track.config,
          color: palette(),
        },
      }));
    });
    dispatch({ type: "UPDATE_MIDI", payload: newMidiState });
    await fileStorage.storeData({ midi: newMidiState });
  }, [fileStorage, midiState]);
  const clearMidi = async () => {
    dispatch({ type: "UPDATE_MIDI", payload: undefined });
    await fileStorage.storeData({ midi: null });
  };
  const clearAudio = async () => {
    dispatch({ type: "SET_AUDIO_HANDLER", payload: undefined });
    await fileStorage.storeData({ audio: null });
  };
  return {
    appState,
    updateMidi,
    updateTrackConfig,
    setAudioHandler,
    updateRendererConfig,
    randomizeColorsColorful,
    randomizeColorsGradient,
    clearMidi,
    clearAudio,
  };
};
