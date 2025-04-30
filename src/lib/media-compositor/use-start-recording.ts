import { useState, useCallback, useRef } from "react";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";
import { RendererConfig } from "@/lib/renderers";
import { SerializedAudio } from "@/lib/audio";
import { MidiTracks } from "@/lib/midi";
import { startRecording } from "./recorder";
import { toast } from "sonner";

interface Props {
  serializedAudio?: SerializedAudio;
  midiTracks?: MidiTracks;
  rendererConfig: RendererConfig;
}
export function useStartRecording({
  serializedAudio,
  midiTracks,
  rendererConfig,
}: Props) {
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
}
