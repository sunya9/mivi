import { getRandomTailwindColor } from "@/lib/tailwindColors";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  getDefaultTrackConfig,
  MidiTrack,
  MidiTracks,
  TrackConfig,
} from "@/types/midi";
import { Midi } from "@tonejs/midi";
import defaultsDeep from "lodash.defaultsdeep";
import { useMemo, useCallback } from "react";

const defaultTrackConfig = getDefaultTrackConfig("");

const loadMidi = async (midiFile: File) => {
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
};

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

export const useMidi = () => {
  // don't use undefined because it's not valid json
  const [rawMidiTracks, setMidiTracks] = useLocalStorage<
    MidiTracks | undefined
  >("mivi:midi-tracks");
  const midiTracks: MidiTracks | undefined = useMemo(
    () => overwriteMidiTracks(rawMidiTracks),
    [rawMidiTracks],
  );
  const setMidiFile = useCallback(
    async (midiFile: File | undefined) => {
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
};
