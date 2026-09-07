import type { FileStore } from "@/lib/file-store/file-store";
import type { MidiTracksStore } from "@/lib/midi/midi-tracks-store";
import type { RendererConfigStore } from "@/lib/renderers/renderer-config-store";
import { derived } from "@/lib/store/derived-store";
import type { VisualizerSources } from "@/lib/visualizer/visualizer-engine";

/**
 * Adapts the app's stores to the value stores the engine consumes, so knowledge of the file
 * slots' shape stays here at the composition root.
 */
export function createVisualizerSources(stores: {
  rendererConfigStore: RendererConfigStore;
  midiTracksStore: MidiTracksStore;
  fileStore: FileStore;
}): VisualizerSources {
  const { rendererConfigStore, midiTracksStore, fileStore } = stores;
  return {
    rendererConfig: rendererConfigStore,
    midiTracks: midiTracksStore,
    backgroundImage: derived(
      [fileStore.backgroundImage],
      () => fileStore.backgroundImage.getSnapshot().decoded,
    ),
    serializedAudio: derived([fileStore.audio], () => fileStore.audio.getSnapshot().decoded),
  };
}
