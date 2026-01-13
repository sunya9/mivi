import { useAppContext } from "@/contexts/app-context";
import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { SerializedAudio } from "@/lib/audio/audio";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCacheContext } from "@/lib/cache/cache-context";
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

export function useAudio() {
  const { audioContext } = useAppContext();
  const {
    snapshot: { audioBuffer },
    setAudioBuffer,
  } = useAudioPlaybackStore();
  const cacheContext = useCacheContext();
  const { file: audioFile, setFile } = useIndexedDb(audioDbKey);
  const [isDecoding, setIsDecoding] = useState(false);
  // Track current decode operation to handle cancellation
  const decodeIdRef = useRef(0);

  // Load initial audioBuffer from IndexedDB (Suspense pattern)
  // Only runs on initial load - subsequent file changes use setAudioFile
  if (audioFile) {
    if (!cacheContext.caches.has(initialAudioBufferCacheKey)) {
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
  }

  const setAudioFile = useCallback(
    async (newAudioFile: File | undefined) => {
      if (newAudioFile) {
        const currentDecodeId = ++decodeIdRef.current;
        setIsDecoding(true);
        try {
          const audioBuffer = await createAudioBufferFromFile(
            newAudioFile,
            audioContext,
          );
          // Ignore result if cancelled (decodeId changed)
          if (decodeIdRef.current !== currentDecodeId) return;
          // Also update cache to prevent double decode if component re-renders
          cacheContext.setCache(initialAudioBufferCacheKey, audioBuffer);
          setAudioBuffer(audioBuffer);
          await setFile(newAudioFile);
        } catch (error) {
          // Ignore error if cancelled
          if (decodeIdRef.current !== currentDecodeId) return;
          console.error("Failed to set audio file", error);
          toast.error("Failed to set audio file");
        } finally {
          // Only update state if this is still the current decode operation
          if (decodeIdRef.current === currentDecodeId) {
            setIsDecoding(false);
          }
        }
      } else {
        cacheContext.setCache(initialAudioBufferCacheKey, undefined);
        setAudioBuffer(undefined);
        await setFile(undefined);
      }
    },
    [audioContext, cacheContext, setAudioBuffer, setFile],
  );

  const cancelDecode = useCallback(() => {
    decodeIdRef.current++;
    setIsDecoding(false);
  }, []);

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
    isDecoding,
    cancelDecode,
  };
}
