import { useAppContext } from "@/contexts/app-context";
import { useAudioFileDb } from "@/lib/file-db/file-db-store";
import { type StoredAudioData } from "@/lib/audio/audio";
import { AudioSource, SerializedAudio } from "@/lib/audio/audio";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { errorLogWithToast } from "../utils";
import type { AudioBuffer, AudioContext } from "standardized-audio-context";
import { runDecodeWorker } from "@/lib/audio/run-decode-worker";

function restoreAudioBuffer(data: StoredAudioData, audioContext: AudioContext): AudioBuffer {
  const buffer = audioContext.createBuffer(data.numberOfChannels, data.length, data.sampleRate);
  for (let i = 0; i < data.numberOfChannels; i++) {
    buffer.copyToChannel(new Float32Array(data.channels[i]), i);
  }
  return buffer;
}

export function useAudio() {
  const {
    audioContext,
    audioPlaybackStore: { setAudioBuffer },
  } = useAppContext();

  const { file: audioFile, decoded: storedAudio, setEntry } = useAudioFileDb();

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
        toast.success("Audio file loaded");
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
    toast.info("Audio loading cancelled");
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
