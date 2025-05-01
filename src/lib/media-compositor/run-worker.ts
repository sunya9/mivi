import { proxy, releaseProxy, wrap } from "comlink";
import RecorderWorker from "./recorder.worker?worker";
import { RendererConfig } from "../renderers/renderer";
import { SerializedAudio } from "../audio";
import { MidiTracks } from "../midi";

export function runWorker(
  rendererConfig: RendererConfig,
  midiTracks: MidiTracks,
  serializedAudio: SerializedAudio,
  backgroundImageBitmap: ImageBitmap | undefined,
  onChangeRecordingStatus: (progress: number) => void,
  signal: AbortSignal,
) {
  const onProgress = proxy((progress: number) => {
    if (signal.aborted) return;
    onChangeRecordingStatus(progress);
  });
  const rawWorker = new RecorderWorker();
  const worker = wrap<typeof import("./recorder.worker")>(rawWorker);
  const abortPromise = new Promise<never>((_, reject) => {
    signal.addEventListener(
      "abort",
      () => {
        worker[releaseProxy]();
        rawWorker.terminate();
        console.error("aborted", { cause: signal.reason });
        reject(signal.reason);
      },
      { once: true },
    );
  });
  const promise = worker.startRecording(
    rendererConfig,
    midiTracks,
    serializedAudio,
    backgroundImageBitmap,
    onProgress,
  );
  return Promise.race([abortPromise, promise]);
}
