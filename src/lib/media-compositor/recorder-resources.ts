import { AudioSource } from "@/lib/audio/audio";
import { MidiTracks } from "@/lib/midi/midi";
import { RendererConfig } from "@/lib/renderers/renderer";

export interface RecorderResources {
  readonly midiTracks?: MidiTracks;
  readonly audioSource: AudioSource;
  readonly rendererConfig: RendererConfig;
  readonly backgroundImageBitmap?: ImageBitmap;
}
