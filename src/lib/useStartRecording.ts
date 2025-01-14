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
import { useAtomValue } from "jotai";
import { midiTracksAtom } from "@/atoms/midiTracksAtom";
import { durationAtom } from "@/atoms/durationAtom";
import { audioInfoAtom, serializeAtom } from "@/atoms/playerAtom";

type TypedRendererWorker = typeof import("./recorder.worker");

export const useStartRecording = () => {
  const serializedAudio = useAtomValue(serializeAtom);
  const audioInfo = useAtomValue(audioInfoAtom);
  const duration = useAtomValue(durationAtom);
  const midiTracks = useAtomValue(midiTracksAtom);
  const [recordingState, setRecordingState] = useState<RecordingStatus>(
    new ReadyState(),
  );
  const workerRef = useRef<TypedRendererWorker>(null);
  const startRecording = useCallback(
    async (width: number, height: number, rendererConfig: RendererConfig) => {
      if (!duration || !midiTracks || !audioInfo) {
        console.error(duration, midiTracks, audioInfo);
        throw new Error("Midi state and audio buffer are required");
      }
      if (!serializedAudio) throw new Error("Audio buffer is required");
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
          rendererConfig.fps,
          duration,
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
    [audioInfo, duration, midiTracks, serializedAudio],
  );
  const stopRecording = useCallback(() => {
    workerRef.current = null;
    setRecordingState(new ReadyState());
  }, []);
  const toggleRecording = useCallback(
    (rendererConfig: RendererConfig) => {
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
    },
    [midiTracks, recordingState.isRecording, startRecording, stopRecording],
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
