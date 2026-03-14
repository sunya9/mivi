import { AudioSource } from "../audio/audio";
import { MidiTracks } from "../midi/midi";
import { RendererConfig } from "../renderers/renderer";

export interface RecorderResources {
  readonly midiTracks?: MidiTracks;
  readonly audioSource: AudioSource;
  readonly rendererConfig: RendererConfig;
  readonly backgroundImageBitmap?: ImageBitmap;
}
