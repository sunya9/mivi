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
import { AppToolbar } from "@/components/AppToolbar";

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
    clearMidi,
    clearAudio,
  } = useAppStateReducer(
    fileStorage,
    initialRendererConfig,
    initialAudioHandler,
    midi,
  );

  const setAudio = useCallback(
    async (file: File) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioHandler(
          new AudioHandler(
            audioContext,
            audioBuffer,
            file,
            rendererConfig.previewVolume,
            rendererConfig.previewMuted,
          ),
        );
        await fileStorage.storeData({ audio: file });
      } catch (error) {
        console.error("Failed to set audio", error);
      }
    },
    [
      fileStorage,
      rendererConfig.previewMuted,
      rendererConfig.previewVolume,
      setAudioHandler,
    ],
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
            opacity: 1,
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
    async (track: MidiTrack, midiState?: MidiState) => {
      const newMidiState = updateTrackConfig(track.id, track.config, midiState);
      await fileStorage.storeData({ midi: newMidiState });
    },
    [fileStorage, updateTrackConfig],
  );
  const onRendererConfigChange = useCallback(
    async (
      deepPartialRendererConfig: DeepPartial<RendererConfig>,
      storeConfig = true,
    ) => {
      const mergedRendererConfig = merge(
        rendererConfig,
        deepPartialRendererConfig,
      );
      updateRendererConfig({ ...mergedRendererConfig });
      if (!storeConfig) return;
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
    clearMidi,
    clearAudio,
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
    clearMidi,
    clearAudio,
  } = useApp(loadDb);

  return (
    <div className="container">
      <div className="my-4 items-baseline gap-2 sm:inline-flex">
        <h1 className="text-7xl font-bold">MiVi</h1>
        <p className="-mt-2 text-xl font-medium text-muted-foreground sm:mt-0">
          <span className="text-accent-foreground">MI</span>DI{" "}
          <span className="text-accent-foreground">Vi</span>sualizer
        </p>
      </div>
      <AppToolbar
        midiState={midiState}
        audioHandler={audioHandler}
        rendererConfig={rendererConfig}
      />
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen"
        autoSaveId="midi-visualizer"
      >
        <ResizablePanel defaultSize={40} className="bg-gray-50">
          <LeftPane
            clearMidi={clearMidi}
            clearAudio={clearAudio}
            onMidiSelect={onMidiSelect}
            setAudioFile={setAudio}
            midiState={midiState}
            audio={audioHandler?.audio}
            onTrackChange={(track) => onTrackChange(track, midiState)}
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
