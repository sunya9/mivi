import { rendererConfig } from "tests/fixtures";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { expect, test, vi } from "vitest";

import { bindAnalyserSettings } from "@/lib/player/bind-analyser-settings";
import { createRendererConfigStore } from "@/lib/renderers/renderer-config-store";

function setup() {
  const rendererConfigStore = createRendererConfigStore();
  const playback = createMockStore();
  const unbind = bindAnalyserSettings(rendererConfigStore, playback);
  return { rendererConfigStore, playback, unbind };
}

test("applies the current settings on bind", () => {
  const { playback } = setup();
  const { fftSize, smoothingTimeConstant } = rendererConfig.audioVisualizerConfig;
  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({
    fftSize,
    smoothingTimeConstant,
  });
});

test("re-applies only when the audio visualizer settings change", () => {
  const { rendererConfigStore, playback } = setup();
  const current = rendererConfigStore.getSnapshot();
  vi.clearAllMocks();

  // Unrelated fields keep the same audioVisualizerConfig reference
  rendererConfigStore.set({ ...current, backgroundColor: "#000000" });
  expect(playback.configureAnalyser).not.toHaveBeenCalled();

  rendererConfigStore.set({
    ...current,
    audioVisualizerConfig: { ...current.audioVisualizerConfig, smoothingTimeConstant: 0.1 },
  });
  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({
    fftSize: current.audioVisualizerConfig.fftSize,
    smoothingTimeConstant: 0.1,
  });
});

test("stops following after unbind", () => {
  const { rendererConfigStore, playback, unbind } = setup();
  unbind();
  vi.clearAllMocks();

  rendererConfigStore.set({
    ...rendererConfig,
    audioVisualizerConfig: { ...rendererConfig.audioVisualizerConfig, fftSize: 512 },
  });

  expect(playback.configureAnalyser).not.toHaveBeenCalled();
});
