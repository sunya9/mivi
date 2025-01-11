import { useState } from "react";

import { useCallback, useRef } from "react";
import { MidiState } from "@/types/midi";
import { Measurements } from "arrival-time";
import { AudioHandler } from "@/lib/AudioHandler";
import { MediaCompositorStatus } from "@/lib/MediaCompositor";
import { proxy, transfer } from "comlink";
import {
  RecordingStatus,
  ReadyState,
  RecordingState,
} from "@/lib/RecordingStatus";
import { RendererConfig } from "@/types/renderer";

type TypedRendererWorker = typeof import("./recorder.worker");

export const useStartRecording = (
  midiState?: MidiState,
  audioHandler?: AudioHandler,
) => {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const workerRef = useRef<TypedRendererWorker>(null);
  const startRecording = useCallback(
    async (width: number, height: number, rendererConfig: RendererConfig) => {
      if (!midiState || !audioHandler)
        throw new Error("Midi state and audio buffer are required");
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
          midiState,
          audioHandler.serialize,
          rendererConfig.fps,
          onProgress,
          onError,
        )
        .then((blob) => {
          if (isAborted()) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "animation.webm";
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
    [audioHandler, midiState],
  );
  const stopRecording = useCallback(() => {
    workerRef.current = null;
    setRecordingState(new ReadyState());
  }, []);
  const toggleRecording = useCallback(
    (rendererConfig: RendererConfig) => {
      if (!audioHandler || !midiState) return;
      if (!recordingState.isRecording) {
        startRecording(
          rendererConfig.resolution.width,
          rendererConfig.resolution.height,
          rendererConfig,
        );
      } else {
        stopRecording();
      }
    },
    [
      audioHandler,
      midiState,
      recordingState.isRecording,
      startRecording,
      stopRecording,
    ],
  );
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
