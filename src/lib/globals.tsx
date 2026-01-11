import { AudioPlaybackStore } from "./player/audio-playback-store";
import {
  LocalStorageRepository,
  StorageRepository,
} from "./storage/storage-repository";

export interface AppContextValue {
  audioContext: AudioContext;
  audioPlaybackStore: AudioPlaybackStore;
}

export function createAppContext(
  audioContext: AudioContext = new AudioContext(),
  storage: StorageRepository = new LocalStorageRepository(),
): AppContextValue {
  const audioPlaybackStore = new AudioPlaybackStore(audioContext, storage);
  return {
    audioContext,
    audioPlaybackStore,
  };
}
