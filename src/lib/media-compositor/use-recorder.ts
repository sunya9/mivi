import { useState, useCallback, useRef } from "react";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";
import { toast } from "sonner";
import { runWorker } from "./run-worker";
import { PartialRecorderResources } from "./recorder-resources";
import { errorLogWithToast } from "../utils";

export function useRecorder(resources: PartialRecorderResources) {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const toggleRecording = useCallback(async () => {
    if (!recordingState.isRecording) {
      const midiTracks = resources.midiTracks;
      const serializedAudio = resources.serializedAudio;
      if (!midiTracks || !serializedAudio) {
        errorLogWithToast("Please select a MIDI file and audio file.");
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
      toast("Exporting...");

      return runWorker(
        {
          ...resources,
          midiTracks,
          serializedAudio,
        },
        onProgress,
        signal,
      )
        .then((blob) => {
          if (signal.aborted) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `mivi-${midiTracks.name}.${resources.rendererConfig.format}`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Export completed");
        })
        .catch((error) => {
          errorLogWithToast("Failed during recording", error);
        })
        .finally(() => {
          abortControllerRef.current = null;
          setRecordingState(new ReadyState());
        });
    } else {
      abortControllerRef.current?.abort(new Error("Cancelled"));
      setRecordingState(new ReadyState());
    }
  }, [recordingState.isRecording, resources]);
  return { recordingState, toggleRecording };
}
