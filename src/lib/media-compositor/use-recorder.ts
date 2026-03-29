import { useState, useCallback, useRef } from "react";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";
import { toast } from "sonner";
import { runWorker } from "./run-worker";
import type { ActivePhase } from "./export-progress-tracker";
import { errorLogWithToast } from "../utils";
import type { MidiTracks } from "@/lib/midi/midi";
import type { AudioSource } from "@/lib/audio/audio";
import type { RendererConfig } from "@/lib/renderers/renderer";

export function useRecorder(resources: {
  midiTracks?: MidiTracks;
  audioSource?: AudioSource;
  rendererConfig: RendererConfig;
  backgroundImageBitmap?: ImageBitmap;
}) {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(new ReadyState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const toggleRecording = useCallback(async () => {
    if (!recordingState.isRecording) {
      const midiTracks = resources.midiTracks;
      const audioSource = resources.audioSource;
      const rendererType = resources.rendererConfig.type;
      const audioVisualizerStyle = resources.rendererConfig.audioVisualizerConfig.style;

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
      toast("Exporting...");

      return runWorker(
        {
          ...resources,
          midiTracks,
          audioSource,
        },
        onProgress,
        signal,
      )
        .then((blob) => {
          if (signal.aborted) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const exportName = midiTracks?.name ?? audioSource.name ?? "audio";
          a.download = `mivi-${exportName}.${resources.rendererConfig.format}`;
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
