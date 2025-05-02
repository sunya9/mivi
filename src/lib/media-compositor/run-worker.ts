import { proxy, releaseProxy, wrap } from "comlink";
import RecorderWorker from "./recorder.worker?worker";
import { RecorderResources } from "./recorder-resources";

export function runWorker(
  resources: RecorderResources,
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
  const promise = worker.startRecording(resources, onProgress);
  return Promise.race([abortPromise, promise]);
}
