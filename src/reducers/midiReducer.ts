import { useReducer } from "react";
import { MidiState, MidiTrack } from "../types/midi";

type MidiAction =
  | {
      type: "UPDATE_MIDI";
      payload: { name: string; tracks: MidiTrack[]; duration: number };
    }
  | {
      type: "UPDATE_TRACK_SETTINGS";
      payload: {
        trackId: string;
        settings: Partial<MidiTrack["settings"]>;
      };
    };

export function midiReducer(
  state: MidiState | undefined,
  action: MidiAction,
): MidiState | undefined {
  switch (action.type) {
    case "UPDATE_MIDI":
      return {
        ...state,
        name: action.payload.name,
        tracks: action.payload.tracks,
        duration: action.payload.duration,
      };
    case "UPDATE_TRACK_SETTINGS":
      if (!state) return state;
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === action.payload.trackId
            ? {
                ...track,
                settings: { ...track.settings, ...action.payload.settings },
              }
            : track,
        ),
      };
    default:
      return state;
  }
}

export const useMidiReducer = (midi?: MidiState) => {
  const [midiState, dispatch] = useReducer(midiReducer, midi);
  const updateMidi = (midi: MidiState) =>
    dispatch({ type: "UPDATE_MIDI", payload: midi });
  const updateTrackSettings = (
    trackId: string,
    settings: Partial<MidiTrack["settings"]>,
  ) =>
    dispatch({ type: "UPDATE_TRACK_SETTINGS", payload: { trackId, settings } });
  return { midiState, updateMidi, updateTrackSettings };
};
