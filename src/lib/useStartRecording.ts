import { useState } from "react";

import { useCallback, useRef } from "react";
import { RecordingStatus, ReadyState } from "@/lib/RecordingStatus";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/types/audio";
import { MidiTracks } from "@/types/midi";
import { startRecording } from "@/lib/recorder";
import { toast } from "sonner";

interface Props {
  serializedAudio?: SerializedAudio;
  duration: number;
  midiTracks?: MidiTracks;
  filename?: string;
  rendererConfig: RendererConfig;
}
export const useStartRecording = ({
  serializedAudio,
  duration,
  midiTracks,
  filename,
  rendererConfig,
}: Props) => {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const toggleRecording = useCallback(async () => {
    if (!midiTracks || !serializedAudio || !filename) {
      toast.error("Please select a MIDI file and audio file.");
      return;
    }
    if (!recordingState.isRecording) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      try {
        await startRecording({
          onChangeRecordingStatus: setRecordingState,
          rendererConfig,
          midiTracks,
          filename,
          serializedAudio,
          duration,
          signal: abortController.signal,
        });
      } catch (error) {
        console.error("catch on toggleRecording.", error);
      } finally {
        abortControllerRef.current = null;
      }
    } else {
      abortControllerRef.current?.abort("Cancelled by user");
    }
  }, [
    midiTracks,
    serializedAudio,
    filename,
    recordingState.isRecording,
    rendererConfig,
    duration,
  ]);
  return { recordingState, toggleRecording };
};
