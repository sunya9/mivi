import { runDecodeWorker } from "@/lib/audio/run-decode-worker";
import { expect, test } from "vitest";

test("worker completes successfully", async () => {
  const abortcontroller = new AbortController();
  const blob = await fetch("./tests/fixtures/test.mp3").then((res) => res.blob());
  const audioFile = new File([blob], "test.mp3", { type: "audio/mpeg" });
  const result = await runDecodeWorker(audioFile, abortcontroller.signal);
  expect(result.length).toBe(217728);
  expect(result.numberOfChannels).toBe(2);
  expect(result.channels[0]).toBeInstanceOf(Float32Array);
  expect(result.channels[1]).toBeInstanceOf(Float32Array);
  expect(result.sampleRate).toBe(48000);
});

test("worker fails with error", async () => {
  const abortcontroller = new AbortController();
  const file = new File(["audio"], "test.mp3", { type: "audio/mpeg" });
  await expect(runDecodeWorker(file, abortcontroller.signal)).rejects.toThrow();
});

test("worker is aborted", async () => {
  const controller = new AbortController();
  const error = new Error("abort error");
  const file = new File(["audio"], "test.mp3", { type: "audio/mpeg" });
  const p = runDecodeWorker(file, controller.signal);
  controller.abort(error);
  await expect(p).rejects.toThrow(error);
});
