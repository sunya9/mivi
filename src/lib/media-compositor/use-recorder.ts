import { useState, useCallback, useRef } from "react";

import { toast } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { errorLogWithToast } from "@/lib/error-toast";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";

import type { ActivePhase } from "./export-progress-tracker";
import { runRecorder } from "./run-recorder-worker";

export function useRecorder() {
  const { midiTracksStore, rendererConfigStore, fileStore } = useAppContext();
  const [recordingState, setRecordingState] = useState<RecordingStatus>(new ReadyState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const toggleRecording = useCallback(async () => {
    if (!recordingState.isRecording) {
      // Export needs the values at the moment it starts, so read the stores instead of subscribing
      const midiTracks = midiTracksStore.getSnapshot();
      const rendererConfig = rendererConfigStore.getSnapshot();
      const audio = fileStore.audio.getSnapshot();
      const audioSource =
        audio.file && audio.decoded
          ? { name: audio.file.name, serialized: audio.decoded }
          : undefined;
      const backgroundImageBitmap = fileStore.backgroundImage.getSnapshot().decoded;
      const rendererType = rendererConfig.type;
      const audioVisualizerStyle = rendererConfig.audioVisualizerConfig.style;

      // Audio is always required
      if (!audioSource) {
        errorLogWithToast("Please select an audio file.");
        return;
      }

      // MIDI is required unless renderer type is "none" AND audio visualizer is enabled
      const needsMidi = rendererType !== "none";
      const hasAudioVisualizer = audioVisualizerStyle !== "none";
      if (needsMidi && !midiTracks) {
        errorLogWithToast("Please select a MIDI file.");
        return;
      }
      if (!needsMidi && !hasAudioVisualizer) {
        errorLogWithToast("Please enable audio visualizer or select a MIDI visualization style.");
        return;
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const signal = abortController.signal;
      setRecordingState(new RecordingState(0));
      const onProgress = (progress: number, activePhase?: ActivePhase) => {
        setRecordingState(
          progress < 1 ? new RecordingState(progress, activePhase) : new ReadyState(),
        );
      };

      return runRecorder(
        { midiTracks, audioSource, rendererConfig, backgroundImageBitmap },
        onProgress,
        signal,
      )
        .then((file) => {
          if (signal.aborted) return;
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          const exportName = midiTracks?.name ?? audioSource.name ?? "audio";
          a.download = `mivi-${exportName}.${rendererConfig.format}`;
          a.click();
          URL.revokeObjectURL(url);
          toast.add({ title: "Export completed", type: "success" });
        })
        .catch((error) => {
          if (signal.aborted) {
            toast.add({ title: "Export cancelled", type: "info" });
            return;
          }
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
  }, [recordingState.isRecording, midiTracksStore, rendererConfigStore, fileStore]);
  return { recordingState, toggleRecording };
}
