import { useAppContext } from "@/contexts/app-context";
import { useAudioFileDb } from "@/lib/file-db/file-db-store";
import { type StoredAudioData } from "@/lib/audio/audio";
import { AudioSource, SerializedAudio } from "@/lib/audio/audio";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { errorLogWithToast } from "../utils";

function serializeAudioBuffer(buffer: AudioBuffer): StoredAudioData {
  return {
    channels: Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i)),
    sampleRate: buffer.sampleRate,
    length: buffer.length,
    numberOfChannels: buffer.numberOfChannels,
  };
}

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
  const decodeIdRef = useRef(0);

  const setAudioFile = useCallback(
    async (newAudioFile: File | undefined) => {
      if (!newAudioFile) {
        await setEntry(undefined);
        return;
      }
      const currentDecodeId = ++decodeIdRef.current;
      try {
        setIsDecoding(true);
        const arrayBuffer = await newAudioFile.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        if (decodeIdRef.current !== currentDecodeId) return;
        await setEntry({
          file: newAudioFile,
          decoded: serializeAudioBuffer(decoded),
        });
        toast.success("Audio file loaded");
      } catch (error) {
        if (decodeIdRef.current !== currentDecodeId) return;
        errorLogWithToast("Failed to set audio file", error);
      } finally {
        if (decodeIdRef.current === currentDecodeId) {
          setIsDecoding(false);
        }
      }
    },
    [audioContext, setEntry],
  );

  const cancelDecode = useCallback(() => {
    decodeIdRef.current++;
    setIsDecoding(false);
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
