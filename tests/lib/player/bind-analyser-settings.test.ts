import { createMockStore } from "tests/lib/player/create-mock-store";
import { expect, test, vi } from "vitest";

import { bindAnalyserSettings } from "@/lib/player/bind-analyser-settings";
import { createRendererConfigStore } from "@/lib/renderers/renderer-config-store";

function setup() {
  const rendererConfigStore = createRendererConfigStore();
  const playback = createMockStore();
  bindAnalyserSettings(rendererConfigStore, playback);
  return { rendererConfigStore, playback };
}

test("does nothing while the audio visualizer is off", () => {
  const { playback } = setup();
  expect(playback.configureAnalyser).not.toHaveBeenCalled();
});

test("applies the fft size of the style that gets picked", () => {
  const { rendererConfigStore, playback } = setup();
  const current = rendererConfigStore.getSnapshot();

  rendererConfigStore.set({ ...current, audioVisualizerStyle: "circular" });

  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({
    fftSize: current.circularConfig.fftSize,
  });
});

test("re-applies only when the active style's section changes", () => {
  const { rendererConfigStore, playback } = setup();
  rendererConfigStore.set({ ...rendererConfigStore.getSnapshot(), audioVisualizerStyle: "bars" });
  const current = rendererConfigStore.getSnapshot();
  vi.clearAllMocks();

  rendererConfigStore.set({ ...current, backgroundColor: "#000000" });
  rendererConfigStore.set({
    ...current,
    lineSpectrumConfig: { ...current.lineSpectrumConfig, fftSize: 512 },
  });
  expect(playback.configureAnalyser).not.toHaveBeenCalled();

  rendererConfigStore.set({ ...current, barsConfig: { ...current.barsConfig, fftSize: 512 } });
  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({ fftSize: 512 });
});
