import { useState, useCallback, useRef } from "react";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";
import { RendererConfig } from "@/lib/renderers";
import { SerializedAudio } from "@/lib/audio";
import { MidiTracks } from "@/lib/midi";
import { toast } from "sonner";
import { runWorker } from "./run-worker";

interface Props {
  serializedAudio?: SerializedAudio;
  midiTracks?: MidiTracks;
  rendererConfig: RendererConfig;
  backgroundImageBitmap?: ImageBitmap;
}
export function useRecorder({
  serializedAudio,
  midiTracks,
  rendererConfig,
  backgroundImageBitmap,
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
      const signal = abortController.signal;
      setRecordingState(new RecordingState(0));
      const onProgress = (progress: number) => {
        setRecordingState(
          progress < 1 ? new RecordingState(progress) : new ReadyState(),
        );
      };
      return runWorker(
        rendererConfig,
        midiTracks,
        serializedAudio,
        backgroundImageBitmap,
        onProgress,
        signal,
      )
        .then((blob) => {
          if (signal.aborted) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `mivi-${midiTracks.name}.${rendererConfig.format}`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : String(error);
          toast.error(message);
          console.error("Failed during recording", error);
        })
        .finally(() => {
          abortControllerRef.current = null;
          setRecordingState(new ReadyState());
        });
    } else {
      abortControllerRef.current?.abort(new Error("Cancelled"));
      setRecordingState(new ReadyState());
    }
  }, [
    recordingState.isRecording,
    midiTracks,
    serializedAudio,
    rendererConfig,
    backgroundImageBitmap,
  ]);
  return { recordingState, toggleRecording };
}
