import { useState } from "react";

import { useCallback, useRef } from "react";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/recording-status";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/types/audio";
import { MidiTracks } from "@/types/midi";
import { startRecording } from "@/lib/recorder";
import { toast } from "sonner";

interface Props {
  serializedAudio?: SerializedAudio;
  midiTracks?: MidiTracks;
  rendererConfig: RendererConfig;
}
export const useStartRecording = ({
  serializedAudio,
  midiTracks,
  rendererConfig,
}: Props) => {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const toggleRecording = useCallback(async () => {
    if (!recordingState.isRecording) {
      if (!midiTracks || !serializedAudio) {
        toast.error("Please select a MIDI file and audio file.");
        return;
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setRecordingState(new RecordingState(0));
      return startRecording({
        onChangeRecordingStatus: setRecordingState,
        rendererConfig,
        midiTracks,
        serializedAudio,
        signal: abortController.signal,
      })
        .catch((error) => {
          console.error("catch on toggleRecording.", error);
          throw new Error("failed to start recording", { cause: error });
        })
        .finally(() => {
          abortControllerRef.current = null;
          setRecordingState(new ReadyState());
        });
    } else {
      abortControllerRef.current?.abort("Cancelled by user");
      setRecordingState(new ReadyState());
    }
  }, [midiTracks, serializedAudio, recordingState.isRecording, rendererConfig]);
  return { recordingState, toggleRecording };
};
