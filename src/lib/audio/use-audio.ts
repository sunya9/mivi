import { AppContext } from "@/contexts/app-context";
import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { SerializedAudio } from "@/lib/audio";
import { use, useCallback, useMemo, useState } from "react";
import { FileLike } from "@/lib/file-db";
import { toast } from "sonner";

export async function createAudioBufferFromFile(
  audioFile: FileLike,
  audioContext: AudioContext,
) {
  const arrayBuffer = await audioFile.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

let cachedInitialAudioBuffer: AudioBuffer | undefined;
function loadInitialAudioBuffer(
  audioFile: FileLike | undefined,
  audioContext: AudioContext,
) {
  if (!audioFile) return;
  if (cachedInitialAudioBuffer) return cachedInitialAudioBuffer;
  throw createAudioBufferFromFile(audioFile, audioContext).then((res) => {
    cachedInitialAudioBuffer = res;
    return res;
  });
}

export function useAudio() {
  const { audioContext } = use(AppContext);
  const { file: audioFile, setFile } = useIndexedDb("audio");
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | undefined>(() =>
    loadInitialAudioBuffer(audioFile, audioContext),
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
