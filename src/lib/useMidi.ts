import { useIndexedDb } from "@/lib/useIndexedDb";
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
import { useState, useMemo, useCallback } from "react";

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
    tracks,
    duration: midi.duration,
    minNote: min,
    maxNote: max,
  };
  return { midi, newMidiTracks };
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
  const [rawMidiTracks, setRawMidiTracks] = useLocalStorage<
    MidiTracks | undefined
  >("mivi:midi-tracks");
  const midiTracks: MidiTracks | undefined = useMemo(
    () => overwriteMidiTracks(rawMidiTracks),
    [rawMidiTracks],
  );
  const { file: midiFile, setFile: setDbMidiFile } = useIndexedDb("midi");
  const [midiClass, setMidiClass] = useState<Midi>();
  const setMidiTracks = useCallback(
    (midiTracks: MidiTracks | undefined) => {
      if (midiTracks) {
        setRawMidiTracks(midiTracks);
      } else {
        setRawMidiTracks(undefined);
      }
    },
    [setRawMidiTracks],
  );
  const setMidiFile = useCallback(
    async (midiFile: File | undefined) => {
      if (!midiFile) {
        setMidiTracks(undefined);
        setMidiClass(undefined);
        setDbMidiFile(undefined);
      } else {
        const { midi, newMidiTracks } = await loadMidi(midiFile);
        setMidiTracks(newMidiTracks);
        setMidiClass(midi);
        setDbMidiFile(midiFile);
      }
    },
    [setDbMidiFile, setMidiTracks],
  );
  const midiDuration = midiClass?.duration || 0;
  const midiFilename = midiFile?.name || "";

  return {
    setMidiFile,
    midiTracks,
    midiDuration,
    midiFilename,
    setMidiTracks,
    midiFile,
  };
};
