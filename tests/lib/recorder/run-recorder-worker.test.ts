import { runRecorder } from "@/lib/media-compositor/run-recorder-worker";
import { createEndpoint, releaseProxy, wrap } from "comlink";
import { resources } from "tests/fixtures";
import { expect, test, vi } from "vitest";
import type { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import type { ActivePhase } from "@/lib/media-compositor/export-progress-tracker";

vi.mock("comlink", async (importOriginal) => ({
  ...(await importOriginal<typeof import("comlink")>()),
  wrap: vi.fn<typeof wrap>(),
}));

function createWorkerStub() {
  return {
    startRecording:
      vi.fn<
        (
          resources: RecorderResources,
          onProgress: (progress: number, activePhase?: ActivePhase) => void,
        ) => Promise<File>
      >(),
    [createEndpoint]: vi.fn<() => Promise<MessagePort>>(),
    [releaseProxy]: vi.fn<() => void>(),
  };
}

test("worker is completed", async () => {
  const workerStub = createWorkerStub();
  workerStub.startRecording.mockResolvedValue(new File([], "export.webm"));
  vi.mocked(wrap).mockImplementationOnce(() => workerStub);
  const p = runRecorder(resources, () => {}, new AbortSignal());
  await expect(p).resolves.toBeDefined();
});

test("worker is failed", async () => {
  const error = new Error("test error");
  const workerStub = createWorkerStub();
  workerStub.startRecording.mockRejectedValue(error);
  vi.mocked(wrap).mockImplementationOnce(() => workerStub);
  const p = runRecorder(resources, () => {}, new AbortSignal());
  await expect(p).rejects.toThrow(error);
});

test("worker is aborted", async () => {
  const controller = new AbortController();
  const error = new Error("abort error");
  console.error = vi.fn<(...args: unknown[]) => void>();
  let workerOnProgress: (progress: number) => void = undefined!;
  const workerStub = createWorkerStub();
  workerStub.startRecording.mockImplementation(
    (_, onProgress: (progress: number) => void) =>
      new Promise(() => {
        workerOnProgress = onProgress;
      }),
  );
  vi.mocked(wrap).mockImplementationOnce(() => workerStub);
  const onprogress = vi.fn<(progress: number, activePhase?: ActivePhase) => void>();
  const p = runRecorder(resources, onprogress, controller.signal);
  workerOnProgress(0.1);
  expect(onprogress).toHaveBeenCalledExactlyOnceWith(0.1, undefined);
  controller.abort(error);
  workerOnProgress(0.3);
  expect(onprogress).not.toHaveBeenCalledWith(0.3);
  expect(onprogress).toHaveBeenCalledTimes(1);
  await expect(p).rejects.toThrow(error);
  expect(console.error).toHaveBeenCalledExactlyOnceWith("aborted", {
    cause: error,
  });
});
