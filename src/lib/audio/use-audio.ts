import { AppContext } from "@/contexts/app-context";
import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { SerializedAudio } from "@/lib/audio";
import { ContextType, use, useCallback, useMemo, useState } from "react";
import { FileLike } from "@/lib/file-db";
import { toast } from "sonner";
import { CacheContext } from "@/contexts/files-context";

export async function createAudioBufferFromFile(
  audioFile: FileLike,
  audioContext: AudioContext,
) {
  const arrayBuffer = await audioFile.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

export const initialAudioBufferCacheKey = "initial:audio-buffer";
export const audioDbKey = "db:audio";
function loadInitialAudioBuffer(
  cacheContext: ContextType<typeof CacheContext>,
  audioFile: FileLike | undefined,
  audioContext: AudioContext,
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
      return res;
    });
}

export function useAudio() {
  const { audioContext } = use(AppContext);
  const cacheContext = use(CacheContext);
  const { file: audioFile, setFile } = useIndexedDb(audioDbKey);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | undefined>(() =>
    loadInitialAudioBuffer(cacheContext, audioFile, audioContext),
  );

  const setAudioFile = useCallback(
    async (newAudioFile: FileLike | undefined) => {
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
    [audioContext, setFile],
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
