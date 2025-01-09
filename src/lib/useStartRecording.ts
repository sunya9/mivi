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

type TypedRendererWorker = typeof import("./recorder.worker");

export const useStartRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const workerRef = useRef<TypedRendererWorker>(null);
  const startRecording = useCallback(
    async (
      width: number,
      height: number,
      renderer: string,
      midiState?: MidiState,
      audioHandler?: AudioHandler,
    ) => {
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
          renderer,
          midiState,
          audioHandler.serialize,
          30,
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
    [],
  );
  const stopRecording = useCallback(() => {
    workerRef.current = null;
    setRecordingState(new ReadyState());
  }, []);
  return { recordingState, startRecording, stopRecording };
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
