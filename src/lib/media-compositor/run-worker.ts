import { proxy, releaseProxy, wrap } from "comlink";
import RecorderWorker from "./recorder.worker?worker";
import { RecorderResources } from "./recorder-resources";
import type { ActivePhase } from "./export-progress-tracker";

export function runWorker(
  resources: RecorderResources,
  onChangeRecordingStatus: (progress: number, activePhase?: ActivePhase) => void,
  signal: AbortSignal,
) {
  const onProgress = proxy((progress: number, activePhase?: ActivePhase) => {
    if (signal.aborted) return;
    onChangeRecordingStatus(progress, activePhase);
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
