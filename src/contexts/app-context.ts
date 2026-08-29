import { createContext, use } from "react";
import type { AudioContext } from "standardized-audio-context";

import { AudioPlaybackStoreImpl, type AudioPlaybackStore } from "@/lib/player/audio-playback-store";

export interface AppContextValue {
  audioContext: AudioContext;
  audioPlaybackStore: AudioPlaybackStore;
}

export function createAppContext(audioContext: AudioContext): AppContextValue {
  const audioPlaybackStore = new AudioPlaybackStoreImpl(audioContext);

  return {
    audioContext,
    audioPlaybackStore,
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
