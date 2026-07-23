import { test, expect } from "vitest";
import { commands } from "vitest/browser";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { MuxerImpl } from "@/lib/muxer/muxer";
import { createOpfsExportFile } from "@/lib/media-compositor/opfs-target";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { SerializedAudio } from "@/lib/audio/audio";
import { MidiTracks } from "@/lib/midi/midi";
import type { StreamTargetChunk } from "mediabunny";

const DURATION_SEC = 60;
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;

function createBenchAudio(): SerializedAudio {
  const sampleRate = 44100;
  const length = sampleRate * DURATION_SEC;
  const channels = [new Int16Array(length), new Int16Array(length)];
  for (let i = 0; i < length; i++) {
    channels[0][i] = Math.round(Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 16384);
    channels[1][i] = channels[0][i];
  }
  return { channels, duration: DURATION_SEC, length, sampleRate, numberOfChannels: 2 };
}

function createBenchMidiTracks(): MidiTracks {
  const notes = Array.from({ length: DURATION_SEC * 4 }, (_, i) => ({
    id: i,
    duration: 0.25,
    durationTicks: 240,
    midi: 48 + (i % 24),
    name: "N",
    ticks: i * 240,
    time: i * 0.25,
    velocity: 1,
  }));
  return {
    hash: "bench-hash",
    instanceKey: "bench-instance",
    duration: DURATION_SEC,
    minNote: 48,
    maxNote: 72,
    name: "bench.mid",
    midiOffset: 0,
    tracks: [
      {
        id: "0",
        config: {
          color: "#ff0000",
          name: "Bench",
          opacity: 1,
          scale: 1,
          staccato: false,
          visible: true,
        },
        notes,
      },
    ],
  };
}

function createBenchResources(): RecorderResources {
  return {
    midiTracks: createBenchMidiTracks(),
    audioSource: { name: "bench.mp3", serialized: createBenchAudio() },
    rendererConfig: {
      ...getDefaultRendererConfig(),
      resolution: { width: WIDTH, height: HEIGHT, label: `${WIDTH}×${HEIGHT}` },
      fps: FPS,
      format: "webm" as const,
    },
  };
}

// Reproduces the pre-OPFS behavior (BufferTarget + Blob copy) with the current
// MuxerImpl, so the comparison arm survives without keeping the old code
function createInMemoryTarget() {
  const parts: StreamTargetChunk[] = [];
  let size = 0;
  const target = new WritableStream<StreamTargetChunk>({
    write: (chunk) => {
      parts.push(chunk);
      size = Math.max(size, chunk.position + chunk.data.length);
    },
  });
  return {
    target,
    toBlob: () => {
      const buffer = new Uint8Array(size);
      for (const { data, position } of parts) buffer.set(data, position);
      return new Blob([buffer], { type: "video/webm" });
    },
  };
}

const MB = 2 ** 20;

// usedSize is the V8-managed heap; backingStorageSize is where ArrayBuffer
// contents (PCM, muxer buffers) actually live.
// Multiple GC passes: encoder/frame objects sit in Blink-V8 cycles that a
// single collection round does not fully release
async function snapshotMB(): Promise<number> {
  let result = Infinity;
  for (let i = 0; i < 3; i++) {
    const usage = await commands.getHeapUsage();
    result = Math.min(result, (usage.usedSize + (usage.backingStorageSize ?? 0)) / MB);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return result;
}

interface BenchResult {
  baselineMB: number;
  peakMB: number;
  retainedMB: number;
  releasedMB: number;
  outputMB: number;
  durationSec: number;
}

async function measureExport(
  run: () => Promise<{ output: Blob | File; cleanup?: () => Promise<void> }>,
): Promise<BenchResult> {
  const baselineMB = await snapshotMB();
  await commands.startHeapPolling();
  const startedAt = performance.now();
  let result: { output: Blob | File; cleanup?: () => Promise<void> } | null = await run();
  const durationSec = (performance.now() - startedAt) / 1000;
  const peak = await commands.stopHeapPolling();

  expect(result.output.size).toBeGreaterThan(0);
  const outputMB = result.output.size / MB;
  // GC'd snapshot with the output still referenced, mirroring the app holding
  // it while the object URL is in flight
  const retainedMB = await snapshotMB();
  const cleanup = result.cleanup;
  // eslint-disable-next-line no-useless-assignment -- release the output reference so releasedMB measures post-GC state
  result = null;
  await cleanup?.();
  const releasedMB = await snapshotMB();

  return {
    baselineMB,
    peakMB: (peak.usedSize + peak.backingStorageSize) / MB,
    retainedMB,
    releasedMB,
    outputMB,
    durationSec,
  };
}

function runInMemory(): Promise<BenchResult> {
  return measureExport(async () => {
    const memoryTarget = createInMemoryTarget();
    const resources = createBenchResources();
    const muxer = new MuxerImpl({
      format: resources.rendererConfig.format,
      frameRate: resources.rendererConfig.fps,
      writable: memoryTarget.target,
    });
    using compositor = new MediaCompositor(resources, muxer, () => {});
    await compositor.composite();
    return { output: memoryTarget.toBlob() };
  });
}

function runOpfs(): Promise<BenchResult> {
  return measureExport(async () => {
    const opfsFile = await createOpfsExportFile("bench.webm");
    const resources = createBenchResources();
    const muxer = new MuxerImpl({
      format: resources.rendererConfig.format,
      frameRate: resources.rendererConfig.fps,
      writable: opfsFile.target,
    });
    using compositor = new MediaCompositor(resources, muxer, () => {});
    await compositor.composite();
    return { output: await opfsFile.getFile(), cleanup: () => opfsFile.remove() };
  });
}

// Deltas against each run's own baseline: absolute values drift across runs as
// the shared V8 isolate grows, so only baseline-relative numbers are comparable
function report(label: string, r: BenchResult) {
  const fmt = (n: number) => n.toFixed(1).padStart(7);
  console.log(
    `[bench] ${label.padEnd(10)} baseline:${fmt(r.baselineMB)}MB` +
      `  peakΔ:${fmt(r.peakMB - r.baselineMB)}MB` +
      `  retainedΔ:${fmt(r.retainedMB - r.baselineMB)}MB` +
      `  releasedΔ:${fmt(r.releasedMB - r.baselineMB)}MB` +
      `  output:${fmt(r.outputMB)}MB  took:${r.durationSec.toFixed(1)}s`,
  );
}

// Not a regression test but a comparison harness; run via `pnpm bench:memory`
test.skipIf(!import.meta.env.VITE_BENCH)(
  "memory benchmark: in-memory vs OPFS stream target",
  { timeout: 600_000 },
  async () => {
    const inMemory = await runInMemory();
    report("in-memory", inMemory);
    const opfs = await runOpfs();
    report("opfs", opfs);

    expect(inMemory.outputMB).toBeCloseTo(opfs.outputMB, 0);

    console.log(
      `[bench] Δ(mem-opfs) peakΔ: ${(inMemory.peakMB - inMemory.baselineMB - (opfs.peakMB - opfs.baselineMB)).toFixed(1)}MB` +
        `  retainedΔ: ${(inMemory.retainedMB - inMemory.baselineMB - (opfs.retainedMB - opfs.baselineMB)).toFixed(1)}MB` +
        `  (output file: ${inMemory.outputMB.toFixed(1)}MB)`,
    );
  },
);
