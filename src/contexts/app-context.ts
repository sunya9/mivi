import { createContext, use } from "react";
import { AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import { LocalStorageRepository } from "@/lib/storage/storage-repository";

export interface AppContextValue {
  audioContext: AudioContext;
  audioPlaybackStore: AudioPlaybackStore;
}

export function createAppContext(audioContext: AudioContext): AppContextValue {
  const audioPlaybackStore = new AudioPlaybackStore(
    audioContext,
    new LocalStorageRepository(),
  );

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
