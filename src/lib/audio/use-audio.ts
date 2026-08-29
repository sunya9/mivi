import { useAppContext } from "@/contexts/app-context";
import { useAudioFileDb } from "@/lib/file-db/file-db-store";
import { type StoredAudioData } from "@/lib/audio/audio";
import { AudioSource, SerializedAudio } from "@/lib/audio/audio";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { errorLogWithToast } from "../utils";
import type { AudioBuffer, AudioContext } from "standardized-audio-context";
import { runDecodeWorker } from "@/lib/audio/run-decode-worker";
import { floatToInt16, int16ToFloat } from "@/lib/audio/pcm";
import { toast } from "@/components/ui/toast";

function restoreAudioBuffer(data: StoredAudioData, audioContext: AudioContext): AudioBuffer {
  const buffer = audioContext.createBuffer(data.numberOfChannels, data.length, data.sampleRate);
  for (let i = 0; i < data.numberOfChannels; i++) {
    buffer.copyToChannel(int16ToFloat(data.channels[i]), i);
  }
  return buffer;
}

function normalizeStoredAudio(data: StoredAudioData): StoredAudioData {
  const channels = (data.channels as (Int16Array | Float32Array)[]).map((channel) =>
    channel instanceof Int16Array ? channel : floatToInt16(channel),
  );
  return { ...data, channels };
}

export function useAudio() {
  const {
    audioContext,
    audioPlaybackStore: { setAudioBuffer },
  } = useAppContext();

  const { file: audioFile, decoded: rawStoredAudio, setEntry } = useAudioFileDb();

  const storedAudio = useMemo(
    () => (rawStoredAudio ? normalizeStoredAudio(rawStoredAudio) : undefined),
    [rawStoredAudio],
  );

  const audioBuffer = useMemo(
    () => (storedAudio ? restoreAudioBuffer(storedAudio, audioContext) : undefined),
    [storedAudio, audioContext],
  );
  const setAudioBufferEvent = useEffectEvent(setAudioBuffer);

  // Sync audioBuffer to the playback store
  useEffect(() => {
    setAudioBufferEvent(audioBuffer);
  }, [audioBuffer]);

  const [isDecoding, setIsDecoding] = useState(false);
  const abortControllerRef = useRef<AbortController>(null);

  const setAudioFile = useCallback(
    async (newAudioFile: File | undefined) => {
      abortControllerRef.current?.abort();

      if (!newAudioFile) {
        await setEntry(undefined);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsDecoding(true);
        const decoded = await runDecodeWorker(newAudioFile, controller.signal);
        await setEntry({ file: newAudioFile, decoded });
        toast.add({ title: "Audio file loaded", type: "success" });
      } catch (error) {
        if (controller.signal.aborted) return;
        errorLogWithToast("Failed to set audio file", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsDecoding(false);
        }
      }
    },
    [setEntry],
  );

  const cancelDecode = useCallback(() => {
    if (!abortControllerRef.current) return;
    abortControllerRef.current.abort();
    setIsDecoding(false);
    toast.add({ title: "Audio loading cancelled", type: "info" });
  }, []);

  const serializedAudio: SerializedAudio | undefined = useMemo(() => {
    if (!storedAudio) return;
    return {
      ...storedAudio,
      duration: storedAudio.length / storedAudio.sampleRate,
    };
  }, [storedAudio]);

  const audioSource: AudioSource | undefined = useMemo(() => {
    if (!serializedAudio || !audioFile) return;
    return { name: audioFile.name, serialized: serializedAudio };
  }, [serializedAudio, audioFile]);

  return {
    audioBuffer,
    setAudioFile,
    audioSource,
    serializedAudio,
    audioFile,
    isDecoding,
    cancelDecode,
  };
}
