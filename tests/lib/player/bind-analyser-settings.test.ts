import { rendererConfig } from "tests/fixtures";
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

test("applies the current settings on bind", () => {
  const { playback } = setup();
  const { fftSize } = rendererConfig.audioVisualizerConfig;
  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({ fftSize });
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
    audioVisualizerConfig: { ...current.audioVisualizerConfig, fftSize: 512 },
  });
  expect(playback.configureAnalyser).toHaveBeenCalledExactlyOnceWith({ fftSize: 512 });
});
