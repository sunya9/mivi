import type { AudioPlaybackStore } from "@/lib/player/audio-playback-store";
import {
  type AudioAnalyzerConfig,
  type RendererConfig,
  selectAudioAnalyzerConfig,
} from "@/lib/renderers/renderer-config";
import type { ReadableStore } from "@/lib/store/observable-store";

export function bindAnalyserSettings(
  rendererConfigStore: ReadableStore<RendererConfig>,
  playback: AudioPlaybackStore,
): void {
  let applied: AudioAnalyzerConfig | null = null;
  const apply = () => {
    const config = selectAudioAnalyzerConfig(rendererConfigStore.getSnapshot());
    if (config === applied) return;
    applied = config;
    if (config) playback.configureAnalyser({ fftSize: config.fftSize });
  };
  apply();
  rendererConfigStore.subscribe(apply);
}
