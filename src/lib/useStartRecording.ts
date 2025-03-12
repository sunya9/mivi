import { useState } from "react";

import { useCallback, useRef } from "react";
import { Measurements } from "arrival-time";
import { MediaCompositorStatus } from "@/lib/MediaCompositor";
import { proxy, transfer } from "comlink";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/RecordingStatus";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/types/audio";
import { MidiTracks } from "@/types/midi";

type TypedRendererWorker = typeof import("./recorder.worker");

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
  const canRecording = serializedAudio && midiTracks && filename;
  const workerRef = useRef<TypedRendererWorker>(null);
  const startRecording = useCallback(
    async (width: number, height: number, rendererConfig: RendererConfig) => {
      if (!canRecording) {
        throw new Error("Cannot start recording because of missing files");
      }
      const worker = new ComlinkWorker<TypedRendererWorker>(
        new URL("./recorder.worker", import.meta.url),
      );
      workerRef.current = worker;
      const isAborted = () => workerRef.current !== worker;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const offscreen = canvas.transferControlToOffscreen();
      const onProgress = proxy(
        (
          progress: number,
          eta: Measurements,
          status: MediaCompositorStatus,
        ) => {
          if (isAborted()) return;
          const text = formatStatus(status);
          setRecordingState(new RecordingState(progress, text, eta));
        },
      );
      const onError = proxy((error: Error) => {
        console.error(error);
      });
      return worker
        .startRecording(
          transfer(offscreen, [offscreen]),
          rendererConfig,
          midiTracks,
          serializedAudio,
          duration,
          onProgress,
          onError,
        )
        .then((blob) => {
          if (isAborted()) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `mivi-${filename}.${rendererConfig.format}`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setRecordingState(new ReadyState());
          workerRef.current = null;
        });
    },
    [canRecording, midiTracks, serializedAudio, duration, filename],
  );
  const stopRecording = useCallback(() => {
    workerRef.current = null;
    setRecordingState(new ReadyState());
  }, []);
  const toggleRecording = useCallback(() => {
    if (!midiTracks) return;
    if (!recordingState.isRecording) {
      startRecording(
        rendererConfig.resolution.width,
        rendererConfig.resolution.height,
        rendererConfig,
      );
    } else {
      stopRecording();
    }
  }, [
    midiTracks,
    recordingState.isRecording,
    startRecording,
    stopRecording,
    rendererConfig,
  ]);
  return { recordingState, toggleRecording };
};

function formatStatus(status: "render" | "encode" | "complete") {
  switch (status) {
    case "render":
      return "Rendering…";
    case "encode":
      return "Encoding…";
    case "complete":
      return "Complete.";
  }
}
