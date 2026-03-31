import { releaseProxy, wrap } from "comlink";
import type { StoredAudioData } from "./audio";

export function runDecodeWorker(file: File, signal: AbortSignal): Promise<StoredAudioData> {
  const rawWorker = new Worker(new URL("./decode-audio.worker.ts", import.meta.url), {
    type: "module",
  });
  const worker = wrap<typeof import("./decode-audio.worker")>(rawWorker);
  const abortPromise = new Promise<never>((_, reject) => {
    signal.addEventListener(
      "abort",
      () => {
        worker[releaseProxy]();
        rawWorker.terminate();
        reject(signal.reason);
      },
      { once: true },
    );
  });
  const promise = worker.decodeAudio(file);

  return Promise.race([abortPromise, promise]);
}
