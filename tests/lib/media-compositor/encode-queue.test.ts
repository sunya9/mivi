import { test, expect, vi } from "vitest";

import { EncodeQueue } from "@/lib/media-compositor/encode-queue";

class FakeEncoder extends EventTarget {
  encodeQueueSize = 0;
  state: CodecState = "configured";
  encode = vi.fn<(frame: string, options?: { keyFrame: boolean }) => void>(() => {
    this.encodeQueueSize++;
  });
  flush = vi.fn<() => Promise<void>>(async () => {});
  close = vi.fn<() => void>(() => {
    this.state = "closed";
  });

  dequeue(count = 1) {
    this.encodeQueueSize -= count;
    this.dispatchEvent(new Event("dequeue"));
  }
}

function setup() {
  const encoder = new FakeEncoder();
  const onDequeue = vi.fn<() => void>();
  const queue = new EncodeQueue(encoder, onDequeue);
  return { encoder, onDequeue, queue };
}

test("encode forwards its arguments to the encoder", () => {
  const { encoder, queue } = setup();

  queue.encode("frame", { keyFrame: true });

  expect(encoder.encode).toHaveBeenCalledWith("frame", { keyFrame: true });
});

test("completed is the submitted count minus what the encoder still holds", () => {
  const { encoder, queue } = setup();

  queue.encode("a");
  queue.encode("b");
  queue.encode("c");
  expect(queue.pending).toBe(3);
  expect(queue.completed).toBe(0);

  encoder.dequeue(2);
  expect(queue.pending).toBe(1);
  expect(queue.completed).toBe(2);
});

test("onDequeue is called on every dequeue until closed", () => {
  const { encoder, onDequeue, queue } = setup();

  encoder.dequeue();
  encoder.dequeue();
  expect(onDequeue).toHaveBeenCalledTimes(2);

  queue.close();
  encoder.dequeue();
  expect(onDequeue).toHaveBeenCalledTimes(2);
});

test("nextDequeue resolves on the next dequeue event", async () => {
  const { encoder, queue } = setup();
  const signal = new AbortController().signal;

  const waiting = queue.nextDequeue(signal);
  encoder.dequeue();

  await expect(waiting).resolves.toBeUndefined();
});

test("nextDequeue rejects with the abort reason when aborted while waiting", async () => {
  const { queue } = setup();
  const controller = new AbortController();
  const reason = new Error("cancelled");

  const waiting = queue.nextDequeue(controller.signal);
  controller.abort(reason);

  await expect(waiting).rejects.toBe(reason);
});

test("nextDequeue rejects immediately when the signal is already aborted", async () => {
  const { queue } = setup();
  const controller = new AbortController();
  const reason = new Error("cancelled");
  controller.abort(reason);

  await expect(queue.nextDequeue(controller.signal)).rejects.toBe(reason);
});

test("flush delegates to the encoder", async () => {
  const { encoder, queue } = setup();

  await queue.flush();

  expect(encoder.flush).toHaveBeenCalledOnce();
});

test("close closes the encoder only once", () => {
  const { encoder, queue } = setup();

  queue.close();
  expect(encoder.close).toHaveBeenCalledOnce();

  queue.close();
  expect(encoder.close).toHaveBeenCalledOnce();
});
