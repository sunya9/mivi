import { useState, useCallback, useRef } from "react";

import { toast } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { errorLogWithToast } from "@/lib/error-toast";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";
import { m } from "@/paraglide/messages";

import type { ActivePhase } from "./export-progress-tracker";
import type { ExportPhase } from "./media-compositor";
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
          ? { name: audio.file.name, file: audio.file, serialized: audio.decoded }
          : undefined;
      const backgroundImageBitmap = fileStore.backgroundImage.getSnapshot().decoded;
      const rendererType = rendererConfig.type;
      const audioVisualizerStyle = rendererConfig.audioVisualizerConfig.style;

      // Audio is always required
      if (!audioSource) {
        errorLogWithToast(m.export_error_no_audio());
        return;
      }

      // MIDI is required unless renderer type is "none" AND audio visualizer is enabled
      const needsMidi = rendererType !== "none";
      const hasAudioVisualizer = audioVisualizerStyle !== "none";
      if (needsMidi && !midiTracks) {
        errorLogWithToast(m.export_error_no_midi());
        return;
      }
      if (!needsMidi && !hasAudioVisualizer) {
        errorLogWithToast(m.export_error_nothing_to_render());
        return;
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const signal = abortController.signal;
      setRecordingState(new RecordingState(0));
      const onProgress = (progress: number, activePhase?: ActivePhase<ExportPhase>) => {
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
          toast.add({ title: m.export_completed(), type: "success" });
        })
        .catch((error) => {
          if (signal.aborted) {
            toast.add({ title: m.export_cancelled(), type: "info" });
            return;
          }
          errorLogWithToast(m.export_failed(), error);
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
