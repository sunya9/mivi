import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultTrackConfig,
  MidiTrack,
  MidiTracks,
  TrackConfig,
} from "@/lib/midi/midi";
import { hashArrayBuffer } from "@/lib/hash";
import { Midi } from "@tonejs/midi";
import { defaultsDeep } from "lodash-es";
import { useMemo, useCallback } from "react";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";

const defaultTrackConfig = getDefaultTrackConfig("");

async function loadMidi(
  midiFile: File,
  arrayBuffer: ArrayBuffer,
  hash?: string,
) {
  const [computedHash, midi] = await Promise.all([
    hash ? Promise.resolve(hash) : hashArrayBuffer(arrayBuffer),
    Promise.resolve(new Midi(arrayBuffer)),
  ]);
  const tracks = midi.tracks.map((track, index): MidiTrack => {
    const color = "#ffffff";
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
    hash: computedHash,
    instanceKey: crypto.randomUUID(),
    name: midiFile.name,
    tracks,
    duration: midi.duration,
    minNote: min,
    maxNote: max,
    midiOffset: 0,
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
  return {
    ...midiTracks,
    tracks,
    hash: midiTracks.hash ?? "",
    instanceKey: midiTracks.instanceKey ?? crypto.randomUUID(),
    midiOffset: midiTracks.midiOffset ?? 0,
  };
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
  const { confirm, DialogComponent } = useConfirmDialog();

  const setMidiFile = useCallback(
    async (midiFile: File | undefined) => {
      console.log("MIDI file loaded");
      if (!midiFile) {
        setMidiTracks(undefined);
      } else {
        // Check if the file hash matches the current MIDI file
        const arrayBuffer = await midiFile.arrayBuffer();
        const newHash = await hashArrayBuffer(arrayBuffer);

        if (midiTracks && midiTracks.hash === newHash) {
          // Same file detected - show confirmation dialog
          const shouldOverwrite = await confirm({
            title: "Same file detected",
            description:
              "The same MIDI file is already loaded. Do you want to overwrite the current settings (offset, track settings, etc.)?",
            confirmLabel: "Overwrite",
            cancelLabel: "Keep",
            variant: "default",
          });

          if (!shouldOverwrite) {
            // User chose to keep current state - do nothing
            return;
          }
        }

        // Load and set the new MIDI file (pass hash and arrayBuffer to avoid recomputing)
        const newMidiTracks = await loadMidi(midiFile, arrayBuffer, newHash);
        setMidiTracks(newMidiTracks);
        toast.success("MIDI file loaded");
      }
    },
    [confirm, midiTracks, setMidiTracks],
  );
  return {
    setMidiFile,
    midiTracks,
    setMidiTracks,
    ConfirmDialog: DialogComponent,
  };
}
