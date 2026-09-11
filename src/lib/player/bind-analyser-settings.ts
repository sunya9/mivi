import type { AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import { type RendererConfig, AudioVisualizerConfig } from "@/lib/renderers/renderer-config";
import type { ReadableStore } from "@/lib/store/observable-store";

export function bindAnalyserSettings(
  rendererConfigStore: ReadableStore<RendererConfig>,
  playback: AudioPlaybackStore,
): void {
  let applied: AudioVisualizerConfig | null = null;
  const apply = () => {
    const { audioVisualizerConfig } = rendererConfigStore.getSnapshot();
    if (audioVisualizerConfig === applied) return;
    applied = audioVisualizerConfig;
    playback.configureAnalyser({ fftSize: audioVisualizerConfig.fftSize });
  };
  apply();
  rendererConfigStore.subscribe(apply);
}
