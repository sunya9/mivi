interface QueueingEncoder<TArgs extends unknown[]> {
  readonly encodeQueueSize: number;
  readonly state: CodecState;
  encode(...args: TArgs): void;
  flush(): Promise<void>;
  close(): void;
  addEventListener(type: "dequeue", listener: () => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: "dequeue", listener: () => void): void;
}

export class EncodeQueue<TArgs extends unknown[]> {
  readonly #encoder: QueueingEncoder<TArgs>;
  readonly #onDequeue: () => void;
  #submitted = 0;

  constructor(encoder: QueueingEncoder<TArgs>, onDequeue: () => void) {
    this.#encoder = encoder;
    this.#onDequeue = onDequeue;
    encoder.addEventListener("dequeue", onDequeue);
  }

  get pending() {
    return this.#encoder.encodeQueueSize;
  }

  get completed() {
    return this.#submitted - this.pending;
  }

  encode(...args: TArgs) {
    this.#encoder.encode(...args);
    this.#submitted++;
  }

  nextDequeue(signal: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      signal.throwIfAborted();
      const onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      this.#encoder.addEventListener(
        "dequeue",
        () => {
          signal.removeEventListener("abort", onAbort);
          resolve();
        },
        { once: true, signal },
      );
    });
  }

  flush() {
    return this.#encoder.flush();
  }

  close() {
    this.#encoder.removeEventListener("dequeue", this.#onDequeue);
    if (this.#encoder.state !== "closed") this.#encoder.close();
  }
}
