import type { AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import type { RendererConfig } from "@/lib/renderers/renderer";
import type { ReadableStore } from "@/lib/store/observable-store";

export function bindAnalyserSettings(
  rendererConfigStore: ReadableStore<RendererConfig>,
  playback: AudioPlaybackStore,
): void {
  let applied: RendererConfig["audioVisualizerConfig"] | null = null;
  const apply = () => {
    const { audioVisualizerConfig } = rendererConfigStore.getSnapshot();
    if (audioVisualizerConfig === applied) return;
    applied = audioVisualizerConfig;
    const { fftSize, smoothingTimeConstant } = audioVisualizerConfig;
    playback.configureAnalyser({ fftSize, smoothingTimeConstant });
  };
  apply();
  rendererConfigStore.subscribe(apply);
}
