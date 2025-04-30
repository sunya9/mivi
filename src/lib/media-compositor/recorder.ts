import {
  RecordingState,
  ReadyState,
  RecordingStatus,
} from "./recording-status";
import { SerializedAudio } from "@/lib/audio";
import { MidiTracks } from "@/lib/midi";
import { RendererConfig } from "@/lib/renderers";
import { proxy, releaseProxy, wrap } from "comlink";
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
  const onProgress = proxy((progress: number) => {
    if (signal.aborted) return;
    onChangeRecordingStatus(
      progress < 1 ? new RecordingState(progress) : new ReadyState(),
    );
  });
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
