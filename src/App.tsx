import { Suspense, useCallback, useState } from "react";
import { LeftPane } from "./components/LeftPane";
import { RightPane } from "./components/RightPane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMidiReducer } from "@/reducers/midiReducer";
import { AudioHandler } from "@/lib/AudioHandler";
import { FileStorage, initializeDB } from "@/lib/FileStorage";
import { use } from "react";
import { Midi } from "@tonejs/midi";
import { MidiState, MidiTrack } from "@/types/midi";
import { getRandomTailwindColor } from "@/lib/tailwindColors";

const loadDb = initializeDB().then(async ([db, storeName]) => {
  const fileStorage = new FileStorage(db, storeName);
  const data = await fileStorage.loadData();
  const initialAudioHandler = data.audio
    ? await loadAudio(data.audio)
    : undefined;
  return [
    fileStorage,
    {
      midi: data.midi,
      audio: data.audio,
      initialAudioHandler,
    },
  ] as const;
});

const loadAudio = async (audio: File) => {
  const arrayBuffer = await audio.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return new AudioHandler(audioContext, audioBuffer, audio);
};

const audioContext = new AudioContext();

export const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppInternal />
    </Suspense>
  );
};

const useApp = () => {
  const [fileStorage, { midi, initialAudioHandler }] = use(loadDb);
  const { midiState, updateMidi, updateTrackSettings } = useMidiReducer(midi);
  const [audioHandler, setAudioHandler] = useState(initialAudioHandler);

  const setAudio = useCallback(
    async (file: File) => {
      try {
        fileStorage.storeData({ audio: file });
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioHandler(new AudioHandler(audioContext, audioBuffer, file));
      } catch (error) {
        console.error("Failed to set audio", error);
      }
    },
    [fileStorage],
  );

  const onMidiSelect = useCallback(
    async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      const tracks = midi.tracks.map((track, index) => {
        const color = getRandomTailwindColor();
        return {
          id: crypto.randomUUID(),
          notes: track.notes.map((note) => note.toJSON()),
          settings: {
            name: track.name || `Track ${index + 1}`,
            color,
            visible: true,
          },
        };
      });
      const newMidiState: MidiState = {
        name: file.name,
        duration: midi.duration,
        tracks,
      };
      updateMidi(newMidiState);
      await fileStorage.storeData({ midi: newMidiState });
    },
    [fileStorage, updateMidi],
  );

  const onTrackChange = useCallback(
    async (track: MidiTrack) => {
      updateTrackSettings(track.id, track.settings);
      await fileStorage.storeData({ midi: midiState });
    },
    [fileStorage, midiState, updateTrackSettings],
  );
  return {
    midiState,
    audioHandler,
    setAudio,
    onMidiSelect,
    fileStorage,
    onTrackChange,
  };
};

const AppInternal = () => {
  const { midiState, audioHandler, setAudio, onMidiSelect, onTrackChange } =
    useApp();

  return (
    <div className="container relative before:absolute before:inset-y-0 before:-left-[calc((100dvw-100%)/2)] before:right-full before:z-[-1] before:bg-gray-50 before:content-['']">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel>
          <LeftPane
            onMidiSelect={onMidiSelect}
            setAudioFile={setAudio}
            midiState={midiState}
            audio={audioHandler?.audio}
            onTrackChange={onTrackChange}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <RightPane midiState={midiState} audioHandler={audioHandler} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default App;
