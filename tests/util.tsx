import {
  act,
  renderHook,
  RenderHookOptions,
  RenderHookResult,
  RenderResult,
  render as renderOriginal,
} from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";

import { AppContextValue, createAppContext } from "@/contexts/app-context";
import { ConfirmStore } from "@/lib/confirm/confirm-store";
import { type FileDecoders, FileStore } from "@/lib/file-store/file-store";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { createMidiSettingsStore } from "@/lib/midi/midi-settings-store";
import { createMidiTracksStore } from "@/lib/midi/midi-tracks-store";
import { type AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import { createRendererConfigStore } from "@/lib/renderers/renderer-config-store";
import { ThemeStore } from "@/lib/theme/theme-store";
import { VisualizerEngine } from "@/lib/visualizer/visualizer-engine";
import { createVisualizerSources } from "@/lib/visualizer/visualizer-sources";

import { TestProviders } from "./test-providers";

export async function customRender(
  children: React.ReactNode,
  options?: { appContextValue?: AppContextValue },
): Promise<RenderResult> {
  const appContextValue = options?.appContextValue ?? createAppContext(new AudioContext());
  let result!: RenderResult;
  await act(async () => {
    result = renderOriginal(children, {
      wrapper: ({ children }) => (
        <TestProviders appContextValue={appContextValue}>{children}</TestProviders>
      ),
    });
    await appContextValue.fileStore.preload();
  });
  return result;
}

const unusedDecoder = async () => {
  throw new Error("decoder not stubbed");
};

/** App context around a mocked playback store; nothing is wired, so tests control the store fully */
export function createMockAppContext(
  audioPlaybackStore: AudioPlaybackStore,
  decoders: Partial<FileDecoders> = {},
): AppContextValue {
  const fileStore = new FileStore(new MemoryFileStorage(), {
    midi: unusedDecoder,
    audio: unusedDecoder,
    backgroundImage: unusedDecoder,
    ...decoders,
  });
  const rendererConfigStore = createRendererConfigStore();
  const midiTracksStore = createMidiTracksStore();
  return {
    audioContext: new AudioContext(),
    audioPlaybackStore,
    fileStore,
    rendererConfigStore,
    midiTracksStore,
    midiSettingsStore: createMidiSettingsStore(),
    visualizerEngine: new VisualizerEngine(
      audioPlaybackStore,
      createVisualizerSources({ rendererConfigStore, midiTracksStore, fileStore }),
    ),
    themeStore: new ThemeStore("light"),
    confirmStore: new ConfirmStore(),
  };
}

/**
 * Render a hook with access to the AppContextValue for testing.
 * Returns both the hook result and the appContextValue used.
 */
export async function customRenderHook<T, P>(
  hook: (props: P) => T,
  options?: RenderHookOptions<P> & { appContextValue?: AppContextValue },
) {
  const { appContextValue = createAppContext(new AudioContext()), ...hookOptions } = options ?? {};
  let result!: RenderHookResult<T, P>;
  await act(async () => {
    result = renderHook((props: P) => hook(props), {
      wrapper: ({ children }) => (
        <TestProviders appContextValue={appContextValue}>{children}</TestProviders>
      ),
      ...hookOptions,
    });
    await appContextValue.fileStore.preload();
  });
  return { ...result, appContextValue };
}

export async function fetchFixtureAsFile(path: string, name: string, type: string): Promise<File> {
  return fetch(path)
    .then((res) => res.blob())
    .then((blob) => new File([blob], name, { type }));
}
