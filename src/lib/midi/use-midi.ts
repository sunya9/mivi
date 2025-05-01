import { getRandomTailwindColor } from "@/lib/colors/tailwind-colors";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultTrackConfig,
  MidiTrack,
  MidiTracks,
  TrackConfig,
} from "@/lib/midi/midi";
import { Midi } from "@tonejs/midi";
import defaultsDeep from "lodash.defaultsdeep";
import { useMemo, useCallback } from "react";
import { FileLike } from "../file-db";

const defaultTrackConfig = getDefaultTrackConfig("");

export async function loadMidi(midiFile: FileLike) {
  const arrayBuffer = await midiFile.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  const tracks = midi.tracks.map((track, index): MidiTrack => {
    const color = getRandomTailwindColor();
    const config = getDefaultTrackConfig(
      track.name || `Track ${index + 1}`,
      color,
    );
    return {
      id: crypto.randomUUID(),
      notes: track.notes.map((note) => note.toJSON()),
      config,
    };
  });
  const notes = tracks.map((track) => track.notes).flat();
  const min = notes.reduce((a, b) => Math.min(a, b.midi), Infinity);
  const max = notes.reduce((a, b) => Math.max(a, b.midi), -Infinity);
  const newMidiTracks: MidiTracks = {
    name: midiFile.name,
    tracks,
    duration: midi.duration,
    minNote: min,
    maxNote: max,
  };
  return newMidiTracks;
}

function overwriteMidiTracks(midiTracks: MidiTracks | undefined) {
  if (!midiTracks) return;
  const tracks: MidiTrack[] = midiTracks.tracks.map((track) => {
    const config: TrackConfig = defaultsDeep(track.config, defaultTrackConfig);
    return {
      ...track,
      config,
    };
  });
  return { ...midiTracks, tracks };
}

export function useMidi() {
  // don't use undefined because it's not valid json
  const [rawMidiTracks, setMidiTracks] = useLocalStorage<
    MidiTracks | undefined
  >("mivi:midi-tracks");
  const midiTracks: MidiTracks | undefined = useMemo(
    () => overwriteMidiTracks(rawMidiTracks),
    [rawMidiTracks],
  );
  const setMidiFile = useCallback(
    async (midiFile: FileLike | undefined) => {
      if (!midiFile) {
        setMidiTracks(undefined);
      } else {
        const newMidiTracks = await loadMidi(midiFile);
        setMidiTracks(newMidiTracks);
      }
    },
    [setMidiTracks],
  );
  return {
    setMidiFile,
    midiTracks,
    setMidiTracks,
  };
}
