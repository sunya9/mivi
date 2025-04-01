import { MediaCompositorStatus } from "@/lib/MediaCompositor";
import {
  RecordingState,
  ReadyState,
  RecordingStatus,
} from "@/lib/RecordingStatus";
import { SerializedAudio } from "@/types/audio";
import { MidiTracks } from "@/types/midi";
import { RendererConfig } from "@/types/renderer";
import { Measurements } from "arrival-time";
import { proxy, releaseProxy, transfer, wrap } from "comlink";
import RecorderWorker from "./recorder.worker?worker";

export function startRecording(options: {
  rendererConfig: RendererConfig;
  midiTracks: MidiTracks;
  serializedAudio: SerializedAudio;
  onChangeRecordingStatus: (status: RecordingStatus) => void;
  signal: AbortSignal;
}) {
  const {
    rendererConfig,
    midiTracks,
    serializedAudio,
    onChangeRecordingStatus,
    signal,
  } = options;
  const rawWorker = new RecorderWorker();
  const worker = wrap<typeof import("./recorder.worker")>(rawWorker);
  const canvas = document.createElement("canvas");
  canvas.width = rendererConfig.resolution.width;
  canvas.height = rendererConfig.resolution.height;
  const offscreen = canvas.transferControlToOffscreen();
  const onProgress = proxy(
    (progress: number, eta: Measurements, status: MediaCompositorStatus) => {
      if (signal.aborted) return;
      const text = formatStatus(status);
      if (status === "complete") {
        onChangeRecordingStatus(new ReadyState());
      } else {
        onChangeRecordingStatus(new RecordingState(progress, text, eta));
      }
    },
  );
  const onError = proxy((error: Error) => {
    console.error(error);
  });
  return new Promise<void>((resolve, reject) => {
    signal.addEventListener(
      "abort",
      () => {
        worker[releaseProxy]();
        rawWorker.terminate();
        onChangeRecordingStatus(new ReadyState());
        reject(signal.reason);
      },
      { once: true },
    );
    worker
      .startRecording(
        transfer(offscreen, [offscreen]),
        rendererConfig,
        midiTracks,
        serializedAudio,
        onProgress,
        onError,
      )
      .then((blob) => {
        if (signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mivi-${midiTracks.name}.${rendererConfig.format}`;
        a.click();
        URL.revokeObjectURL(url);
        resolve(void 0);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

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
