import { rendererConfig, testMidiTracks } from "tests/fixtures";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { RafStub } from "tests/raf-stub";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { type PlaybackSnapshot } from "@/lib/player/audio-playback-store";
import { ObservableStore } from "@/lib/store/observable-store";
import { RendererController } from "@/lib/visualizer/renderer-controller";
import { VisualizerEngine } from "@/lib/visualizer/visualizer-engine";

const rafStub = new RafStub();
const mockRender = vi.spyOn(RendererController.prototype, "render").mockImplementation(() => {});
const mockSetRendererConfig = vi
  .spyOn(RendererController.prototype, "setRendererConfig")
  .mockImplementation(() => {});
const mockSetBackgroundImageBitmap = vi
  .spyOn(RendererController.prototype, "setBackgroundImageBitmap")
  .mockImplementation(() => {});

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(rafStub.requestAnimationFrame);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(rafStub.cancelAnimationFrame);
});

afterEach(() => {
  rafStub.reset();
  vi.clearAllMocks();
});

class Stub<T> extends ObservableStore<T> {
  set(value: T) {
    this.setSnapshot(value);
  }
}

function createFakeStore(initial?: Partial<PlaybackSnapshot>) {
  const mock = createMockStore({ snapshot: initial });
  let snapshot = mock.getSnapshot();
  const listeners = new Set<() => void>();
  const store = {
    ...mock,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
  };
  const update = (patch: Partial<PlaybackSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };
  return { store, update };
}

function setup(initial?: Partial<PlaybackSnapshot>) {
  const { store, update } = createFakeStore(initial);
  const sources = {
    rendererConfig: new Stub(rendererConfig),
    midiTracks: new Stub(testMidiTracks),
    backgroundImage: new Stub<ImageBitmap | undefined>(undefined),
    serializedAudio: new Stub(undefined),
  };
  const engine = new VisualizerEngine(store, sources);
  return { engine, store, update, sources };
}

test("owns a canvas and paints the initial sources into it right away", () => {
  const { engine } = setup();

  expect(engine.canvas).toBeInstanceOf(HTMLCanvasElement);
  expect(mockSetRendererConfig).toHaveBeenCalledWith(rendererConfig);
  expect(mockRender).toHaveBeenCalled();
});

test("applies renderer config and background changes to the renderer", async () => {
  const { sources } = setup();
  const bitmap = await createImageBitmap(new OffscreenCanvas(2, 2));
  vi.clearAllMocks();

  const nextConfig = { ...rendererConfig };
  sources.rendererConfig.set(nextConfig);
  expect(mockSetRendererConfig).toHaveBeenCalledExactlyOnceWith(nextConfig);

  sources.backgroundImage.set(bitmap);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledExactlyOnceWith(bitmap);
  expect(mockRender).toHaveBeenCalledTimes(2);
});

test("repaints when midi tracks change", () => {
  const { sources } = setup();
  vi.clearAllMocks();

  const recolored = { ...testMidiTracks };
  sources.midiTracks.set(recolored);

  expect(mockRender).toHaveBeenCalledOnce();
  expect(mockRender.mock.calls[0][0]).toBe(recolored.tracks);
});

test("repaints at the new position while paused", () => {
  const { update } = setup({ status: "paused", position: 0 });
  vi.clearAllMocks();

  update({ position: 5 });

  expect(mockRender).toHaveBeenCalledOnce();
  expect(mockRender.mock.calls[0][1]).toBe(5 + testMidiTracks.midiOffset);
});

test("leaves painting to the frame loop while playing", () => {
  const { sources, store, update } = setup({ status: "paused" });
  // 60fps matches RafStub's step size so every step paints
  sources.rendererConfig.set({ ...rendererConfig, fps: 60 });
  vi.clearAllMocks();

  update({ status: "playing" });
  update({ position: 1 });
  expect(mockRender).not.toHaveBeenCalled();

  rafStub.step();
  rafStub.step();
  expect(mockRender).toHaveBeenCalledTimes(2);
  expect(store.syncFromAudioContext).toHaveBeenCalledTimes(2);
});

test("frequency data decays across frames instead of dropping instantly", () => {
  const { sources, store, update } = setup({ status: "playing" });
  // 60fps matches RafStub's step size so every step paints
  sources.rendererConfig.set({ ...rendererConfig, fps: 60 });
  const spectrum = (value: number) => ({
    frequencyData: new Uint8Array(4).fill(value),
    timeDomainData: new Uint8Array(4).fill(128),
    frequencyBinCount: 4,
    nyquistFrequency: 22050,
  });
  store.getFrequencyData.mockReturnValue(spectrum(255));
  rafStub.step();
  store.getFrequencyData.mockReturnValue(spectrum(0));
  update({ position: 0.02 });
  vi.clearAllMocks();

  rafStub.step();

  const [, , frequencyData] = mockRender.mock.calls[0];
  expect(frequencyData?.frequencyData[0]).toBeGreaterThan(0);
  expect(frequencyData?.frequencyData[0]).toBeLessThan(255);
});

test("stops the loop and resets fps when playback stops", () => {
  const { engine, update } = setup({ status: "playing" });
  rafStub.step();
  vi.clearAllMocks();

  update({ status: "paused" });
  expect(rafStub.cancelAnimationFrame).toHaveBeenCalled();
  expect(engine.fpsCounter.getSnapshot()).toBe(0);

  rafStub.step();
  expect(mockRender).not.toHaveBeenCalled();
});

test("throttles the loop to the configured fps", () => {
  const { sources, update } = setup({ status: "paused" });
  sources.rendererConfig.set({ ...rendererConfig, fps: 30 });
  update({ status: "playing" });
  vi.clearAllMocks();

  // RafStub steps at ~16.7ms; 30fps needs ~33.3ms between paints
  rafStub.step();
  expect(mockRender).toHaveBeenCalledTimes(1);
  rafStub.step();
  expect(mockRender).toHaveBeenCalledTimes(1);
  rafStub.step();
  expect(mockRender).toHaveBeenCalledTimes(2);
});

test("dispose() detaches from every store and halts the loop", () => {
  const { engine, update, sources } = setup({ status: "playing" });
  vi.clearAllMocks();

  engine.dispose();
  sources.rendererConfig.set({ ...rendererConfig });
  sources.midiTracks.set({ ...testMidiTracks });
  update({ position: 3, status: "paused" });
  rafStub.step();

  expect(mockRender).not.toHaveBeenCalled();
  expect(mockSetRendererConfig).not.toHaveBeenCalled();
});

test("fitCanvas contain-fits the bitmap to the container and repaints", () => {
  const { engine } = setup();
  vi.clearAllMocks();
  const { width, height } = rendererConfig.resolution;
  const dpr = window.devicePixelRatio;

  // Wide container: height-constrained
  engine.fitCanvas(10000, 100);
  expect(engine.canvas.height).toBe(100 * dpr);
  // canvas.width stores an integer, so the contain-fit result is truncated
  expect(engine.canvas.width).toBe(Math.trunc(((100 * width) / height) * dpr));

  // Narrow container: width-constrained
  engine.fitCanvas(200, 10000);
  expect(engine.canvas.width).toBe(200 * dpr);
  expect(engine.canvas.height).toBe(Math.trunc(((200 * height) / width) * dpr));
  expect(mockRender).toHaveBeenCalledTimes(2);
});

test("a resolution change refits the canvas and updates its aspect ratio", () => {
  const { engine, sources } = setup();
  engine.fitCanvas(200, 200);
  vi.clearAllMocks();

  const resolution = { width: 100, height: 200, label: "100x200" };
  sources.rendererConfig.set({ ...rendererConfig, resolution });

  expect(engine.canvas.style.aspectRatio).toBe("100 / 200");
  expect(engine.canvas.width).toBe(100 * window.devicePixelRatio);
  expect(engine.canvas.height).toBe(200 * window.devicePixelRatio);
});

test("mountCanvas appends the element and the returned cleanup removes it", () => {
  const { engine } = setup();
  const container = document.createElement("div");

  const unmount = engine.mountCanvas(container);
  expect(container.contains(engine.canvas)).toBe(true);

  unmount();
  expect(container.contains(engine.canvas)).toBe(false);
});

test("invalidate repaints immediately", () => {
  const { engine } = setup();
  vi.clearAllMocks();

  engine.invalidate();

  expect(mockRender).toHaveBeenCalledOnce();
});
