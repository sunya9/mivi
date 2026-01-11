import { AudioPlaybackStore } from "./player/audio-playback-store";
import { LocalStorageRepository } from "./storage/storage-repository";

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
