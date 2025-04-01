import { AppContext } from "@/AppContext";
import { useIndexedDb } from "@/lib/useIndexedDb";
import { SerializedAudio } from "@/types/audio";
import { use, useEffect, useMemo, useState } from "react";

const createAudioBufferFromFile = async (
  audioFile: File,
  audioContext: AudioContext,
) => {
  const arrayBuffer = await audioFile.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
};

export const useAudio = () => {
  const { audioContext } = use(AppContext);
  const { file: audioFile, setFile: setAudioFile } = useIndexedDb("audio");
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const audioDuration = useMemo(() => {
    return audioBuffer?.duration || 0;
  }, [audioBuffer]);
  useEffect(() => {
    if (!audioFile) {
      setAudioBuffer(undefined);
    } else {
      const f = async () => {
        const audioBuffer = await createAudioBufferFromFile(
          audioFile,
          audioContext,
        );
        setAudioBuffer(audioBuffer);
      };
      f();
    }
  }, [audioContext, audioFile]);
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
    audioDuration,
    serializedAudio,
    audioFile,
  };
};
