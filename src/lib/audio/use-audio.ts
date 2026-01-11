import { useAppContext } from "@/contexts/app-context";
import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { SerializedAudio } from "@/lib/audio/audio";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { CacheContextValue, useCacheContext } from "@/lib/cache/cache-context";
import { useAudioPlaybackStore } from "@/lib/player/use-audio-playback-store";

async function createAudioBufferFromFile(
  audioFile: File,
  audioContext: AudioContext,
) {
  const arrayBuffer = await audioFile.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

const initialAudioBufferCacheKey = "initial:audio-buffer";
export const audioDbKey = "db:audio";
function loadInitialAudioBuffer(
  cacheContext: CacheContextValue,
  audioFile: File | undefined,
  audioContext: AudioContext,
  setAudioBuffer: (buffer: AudioBuffer | undefined) => void,
) {
  if (!audioFile) return;
  if (cacheContext.caches.has(initialAudioBufferCacheKey))
    return cacheContext.caches.get(initialAudioBufferCacheKey) as
      | AudioBuffer
      | undefined;
  throw createAudioBufferFromFile(audioFile, audioContext)
    .catch((error) => {
      console.error("Failed to create audio buffer from file", error);
    })
    .then((res) => {
      cacheContext.setCache(initialAudioBufferCacheKey, res);
      if (res) setAudioBuffer(res);
      return res;
    });
}

export function useAudio() {
  const { audioContext } = useAppContext();
  const {
    snapshot: { audioBuffer },
    setAudioBuffer,
  } = useAudioPlaybackStore();
  const cacheContext = useCacheContext();
  const { file: audioFile, setFile } = useIndexedDb(audioDbKey);

  // Load initial audioBuffer from cache/IndexedDB (Suspense pattern)
  // setAudioBuffer is called in the Promise callback when resolved
  loadInitialAudioBuffer(cacheContext, audioFile, audioContext, setAudioBuffer);

  const setAudioFile = useCallback(
    async (newAudioFile: File | undefined) => {
      if (newAudioFile) {
        try {
          const audioBuffer = await createAudioBufferFromFile(
            newAudioFile,
            audioContext,
          );
          setAudioBuffer(audioBuffer);
          await setFile(newAudioFile);
        } catch (error) {
          console.error("Failed to set audio file", error);
          toast.error("Failed to set audio file");
        }
      } else {
        setAudioBuffer(undefined);
        await setFile(undefined);
      }
    },
    [audioContext, setAudioBuffer, setFile],
  );

  const serializedAudio: SerializedAudio | undefined = useMemo(() => {
    if (!audioBuffer) return;
    return {
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      duration: audioBuffer.duration,
      channels: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
        audioBuffer.getChannelData(i),
      ),
    };
  }, [audioBuffer]);

  return {
    audioBuffer,
    setAudioFile,
    serializedAudio,
    audioFile,
  };
}
