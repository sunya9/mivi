import { useAppContext } from "@/contexts/app-context";
import { useSyncExternalStore } from "react";

/**
 * Hook to access the audio playback store.
 * This is the single place where useSyncExternalStore is called for the audio playback store.
 * Returns snapshot values and store methods - no direct store access.
 */
export function useAudioPlaybackStore() {
  const { audioPlaybackStore: store } = useAppContext();

  // Subscribe to store changes - React will re-render when snapshot changes
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return {
    // Snapshot (reactive state)
    snapshot,
    // Methods (stable references due to arrow functions)
    setVolume: store.setVolume,
    toggleMute: store.toggleMute,
    togglePlay: store.togglePlay,
    seek: store.seek,
    syncFromAudioContext: store.syncFromAudioContext,
    setAudioBuffer: store.setAudioBuffer,
    // Getters (non-reactive, for synchronous access)
    getPosition: store.getPosition,
  };
}
