import { Suspense, useCallback } from "react";
import { LeftPane } from "./components/LeftPane";
import { RightPane } from "./components/RightPane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppStateReducer } from "@/reducers/appStateReducer";
import { AudioHandler } from "@/lib/AudioHandler";
import { use } from "react";
import { Midi } from "@tonejs/midi";
import { MidiState, MidiTrack } from "@/types/midi";
import { getRandomTailwindColor } from "@/lib/tailwindColors";
import { RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import merge from "lodash.merge";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "@/components/Loading";
import { loadDb, LoadDbResult } from "@/lib/FileStorage";
import { Fallback } from "@/components/Fallback";

const audioContext = new AudioContext();
const loadDbPromise = loadDb(audioContext);
export const App = () => {
  return (
    <ErrorBoundary fallbackRender={Fallback}>
      <Suspense fallback={<Loading />}>
        <AppInternal loadDb={loadDbPromise} />
      </Suspense>
    </ErrorBoundary>
  );
};

const useApp = (loadDb: Promise<LoadDbResult>) => {
  const [fileStorage, { midi, initialAudioHandler, initialRendererConfig }] =
    use(loadDb);
  const {
    appState: { audioHandler, midiState, rendererConfig },
    updateMidi,
    updateTrackConfig,
    setAudioHandler,
    updateRendererConfig,
    randomizeColorsColorful,
    randomizeColorsGradient,
  } = useAppStateReducer(
    fileStorage,
    initialRendererConfig,
    initialAudioHandler,
    midi,
  );

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
    [fileStorage, setAudioHandler],
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
          config: {
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
      const midiState = updateTrackConfig(track.id, track.config);
      await fileStorage.storeData({ midi: midiState });
    },
    [fileStorage, updateTrackConfig],
  );
  const onRendererConfigChange = useCallback(
    async (deepPartialRendererConfig: DeepPartial<RendererConfig>) => {
      const mergedRendererConfig = merge(
        rendererConfig,
        deepPartialRendererConfig,
      );
      updateRendererConfig({ ...mergedRendererConfig });
      await fileStorage.storeData({ rendererConfig: mergedRendererConfig });
    },
    [fileStorage, rendererConfig, updateRendererConfig],
  );
  return {
    midiState,
    audioHandler,
    setAudio,
    onMidiSelect,
    onTrackChange,
    rendererConfig,
    onRendererConfigChange,
    randomizeColorsColorful,
    randomizeColorsGradient,
  };
};

const AppInternal = ({ loadDb }: { loadDb: Promise<LoadDbResult> }) => {
  const {
    midiState,
    audioHandler,
    setAudio,
    onMidiSelect,
    onTrackChange,
    rendererConfig,
    onRendererConfigChange,
    randomizeColorsColorful,
    randomizeColorsGradient,
  } = useApp(loadDb);

  return (
    <div className="container relative before:absolute before:inset-y-0 before:-left-[calc((100dvw-100%)/2)] before:right-full before:z-[-1] before:bg-gray-50 before:content-['']">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel defaultSize={40} className="bg-gray-50">
          <LeftPane
            onMidiSelect={onMidiSelect}
            setAudioFile={setAudio}
            midiState={midiState}
            audio={audioHandler?.audio}
            onTrackChange={onTrackChange}
            onRandomizeColorsColorful={randomizeColorsColorful}
            onRandomizeColorsGradient={randomizeColorsGradient}
          />
        </ResizablePanel>
        <ResizableHandle className="transition-all hover:bg-primary/50 hover:shadow-lg hover:ring-2 hover:ring-primary/50" />
        <ResizablePanel defaultSize={60}>
          <RightPane
            midiState={midiState}
            audioHandler={audioHandler}
            rendererConfig={rendererConfig}
            onRendererConfigChange={onRendererConfigChange}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
