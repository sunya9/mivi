import { createContext, use } from "react";
import type { AudioContext } from "standardized-audio-context";

import { fileDecoders } from "@/contexts/file-decoders";
import { bindAudioToPlayback } from "@/lib/audio/bind-audio-playback";
import { ConfirmStore } from "@/lib/confirm/confirm-store";
import type { FileStorage } from "@/lib/file-store/file-storage";
import { FileStore } from "@/lib/file-store/file-store";
import { createFileStorage } from "@/lib/file-store/opfs-file-storage";
import { bindMidiTracks } from "@/lib/midi/bind-midi-tracks";
import { createMidiSettingsStore, type MidiSettingsStore } from "@/lib/midi/midi-settings-store";
import { createMidiTracksStore, type MidiTracksStore } from "@/lib/midi/midi-tracks-store";
import { AudioPlaybackStoreImpl, type AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import { bindAnalyserSettings } from "@/lib/player/bind-analyser-settings";
import { bindPageLifecycle } from "@/lib/player/bind-page-lifecycle";
import {
  createRendererConfigStore,
  type RendererConfigStore,
} from "@/lib/renderers/renderer-config-store";
import { type Theme, ThemeStore } from "@/lib/theme/theme-store";
import { VisualizerEngine } from "@/lib/visualizer/visualizer-engine";
import { createVisualizerSources } from "@/lib/visualizer/visualizer-sources";

export interface AppContextValue {
  audioContext: AudioContext;
  audioPlaybackStore: AudioPlaybackStore;
  fileStore: FileStore;
  rendererConfigStore: RendererConfigStore;
  midiTracksStore: MidiTracksStore;
  midiSettingsStore: MidiSettingsStore;
  visualizerEngine: VisualizerEngine;
  themeStore: ThemeStore;
  confirmStore: ConfirmStore;
}

export interface AppContextOptions {
  defaultTheme?: Theme;
  fileStorage?: FileStorage;
}

export function createAppContext(
  audioContext: AudioContext,
  options: AppContextOptions = {},
): AppContextValue {
  const fileStore = new FileStore(options.fileStorage ?? createFileStorage(), fileDecoders);
  const audioPlaybackStore = new AudioPlaybackStoreImpl(audioContext);
  bindAudioToPlayback(fileStore.audio, audioPlaybackStore, audioContext);
  const rendererConfigStore = createRendererConfigStore();
  const midiTracksStore = createMidiTracksStore();
  const midiSettingsStore = createMidiSettingsStore();
  bindMidiTracks(fileStore.midi, midiTracksStore, midiSettingsStore);
  bindAnalyserSettings(rendererConfigStore, audioPlaybackStore);
  bindPageLifecycle(audioPlaybackStore, audioContext);
  const visualizerEngine = new VisualizerEngine(
    audioPlaybackStore,
    createVisualizerSources({ rendererConfigStore, midiTracksStore, fileStore }),
  );
  const themeStore = new ThemeStore(options.defaultTheme ?? "light");
  const confirmStore = new ConfirmStore();

  return {
    audioContext,
    audioPlaybackStore,
    fileStore,
    rendererConfigStore,
    midiTracksStore,
    midiSettingsStore,
    visualizerEngine,
    themeStore,
    confirmStore,
  };
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const context = use(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContext.Provider");
  }
  return context;
}
