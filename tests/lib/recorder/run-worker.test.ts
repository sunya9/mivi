import { runWorker } from "@/lib/media-compositor/run-worker";
import { createEndpoint, releaseProxy, wrap } from "comlink";
import { resources } from "tests/fixtures";
import { expect, test, vi, beforeEach } from "vitest";

vi.mock("comlink", async (importOriginal) => ({
  ...(await importOriginal<typeof import("comlink")>()),
  wrap: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("worker is completed", async () => {
  vi.mocked(wrap).mockImplementationOnce(() => ({
    startRecording: vi.fn().mockResolvedValue(new Blob()),
    [createEndpoint]: vi.fn(),
    [releaseProxy]: vi.fn(),
  }));
  const p = runWorker(resources, () => {}, new AbortSignal());
  await expect(p).resolves.toBeDefined();
});

test("worker is failed", async () => {
  const error = new Error("test error");
  vi.mocked(wrap).mockImplementationOnce(() => ({
    startRecording: vi.fn().mockRejectedValue(error),
    [createEndpoint]: vi.fn(),
    [releaseProxy]: vi.fn(),
  }));
  const p = runWorker(resources, () => {}, new AbortSignal());
  await expect(p).rejects.toThrow(error);
});

test("worker is aborted", async () => {
  const controller = new AbortController();
  const error = new Error("abort error");
  console.error = vi.fn();
  let workerOnProgress: (progress: number) => void = undefined!;
  vi.mocked(wrap).mockImplementationOnce(() => ({
    startRecording: vi.fn().mockImplementation(
      (_, onProgress: (progress: number) => void) =>
        new Promise(() => {
          workerOnProgress = onProgress;
        }),
    ),
    [createEndpoint]: vi.fn(),
    [releaseProxy]: vi.fn(),
  }));
  const onprogress = vi.fn();
  const p = runWorker(resources, onprogress, controller.signal);
  workerOnProgress(0.1);
  expect(onprogress).toHaveBeenCalledExactlyOnceWith(0.1);
  controller.abort(error);
  workerOnProgress(0.3);
  expect(onprogress).not.toHaveBeenCalledWith(0.3);
  expect(onprogress).toHaveBeenCalledTimes(1);
  await expect(p).rejects.toThrow(error);
  expect(console.error).toHaveBeenCalledExactlyOnceWith("aborted", {
    cause: error,
  });
});
