import { test, expect, vi, afterEach } from "vitest";
import {
  ExportProgressTracker,
  type ActivePhase,
} from "@/lib/media-compositor/export-progress-tracker";

function setup() {
  vi.useFakeTimers();
  const onProgress = vi.fn<(progress: number, activePhase?: ActivePhase) => void>();
  const tracker = new ExportProgressTracker(onProgress);
  return { onProgress, tracker };
}

function flush() {
  vi.advanceTimersByTime(500);
}

afterEach(() => {
  vi.useRealTimers();
});

test("reports 0 progress initially when no work is done", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 10 });
  tracker.notify();
  flush();

  expect(onProgress).toHaveBeenCalledWith(0, undefined);
});

test("reports progress across single phase", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 4 });

  tracker.increment("render");
  tracker.increment("render");
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.5, expect.objectContaining({ name: "render" }));
});

test("reports progress across multiple phases", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 5 });
  tracker.addPhase({ name: "encode", total: 5 });

  tracker.complete("render");
  tracker.set("encode", 3);
  flush();

  // 5 + 3 = 8 out of 10
  expect(onProgress).toHaveBeenCalledWith(0.8, expect.objectContaining({ name: "encode" }));
});

test("complete marks phase as fully done", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 100 });

  tracker.complete("render");
  flush();

  expect(onProgress).toHaveBeenCalledWith(1, undefined);
});

test("set sets absolute progress", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 10 });

  tracker.set("render", 7);
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.7, expect.objectContaining({ name: "render" }));
});

test("getCompleted overrides internal count", () => {
  const { onProgress } = setup();
  let externalCount = 0;
  const tracker = new ExportProgressTracker(onProgress);
  tracker.addPhase({ name: "encode", total: 10, getCompleted: () => externalCount });

  externalCount = 5;
  tracker.notify();
  flush();

  expect(onProgress).toHaveBeenCalledWith(0.5, expect.objectContaining({ name: "encode" }));
});

test("getCompleted phase auto-starts its timer when progress is first observed", () => {
  const { onProgress } = setup();
  let externalCount = 0;
  const tracker = new ExportProgressTracker(onProgress);
  tracker.addPhase({ name: "encode", total: 10, getCompleted: () => externalCount });

  externalCount = 1;
  tracker.notify();
  flush();

  vi.advanceTimersByTime(2000);
  externalCount = 5;
  tracker.notify();
  flush();

  // Timer started at first observation (count 1); 4 units in 2.5s → 5 remaining ≈ 3.1s
  const call = onProgress.mock.calls.at(-1);
  expect(call?.[1]?.eta).toBe("0m03s");
});

test("eta stays -- until progress advances past the first observation", () => {
  const { onProgress } = setup();
  let externalCount = 0;
  const tracker = new ExportProgressTracker(onProgress);
  tracker.addPhase({ name: "encode", total: 10, getCompleted: () => externalCount });

  externalCount = 3;
  tracker.notify();
  flush();

  // No progress observed since the timer started, so rate is unknown
  expect(onProgress).toHaveBeenCalledWith(
    0.3,
    expect.objectContaining({ name: "encode", eta: "--" }),
  );
});

test("eta format is NmSSs", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 100 });

  tracker.increment("render");
  // 10s elapsed with 2/100 done → ETA = (10/0.02)*0.98 = 490s = 8m10s
  vi.advanceTimersByTime(10_000);
  tracker.increment("render");
  flush();

  const call = onProgress.mock.calls.at(-1);
  expect(call?.[1]?.eta).toBe("8m10s");
});

test("activePhase is undefined when no phase is in progress", () => {
  const { onProgress, tracker } = setup();
  tracker.addPhase({ name: "render", total: 5 });
  tracker.addPhase({ name: "encode", total: 5 });

  // Nothing started
  tracker.notify();
  flush();
  expect(onProgress).toHaveBeenCalledWith(0, undefined);

  onProgress.mockClear();

  // All complete
  tracker.complete("render");
  tracker.complete("encode");
  flush();
  expect(onProgress).toHaveBeenCalledWith(1, undefined);
});
