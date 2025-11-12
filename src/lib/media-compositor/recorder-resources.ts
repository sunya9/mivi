import { SerializedAudio } from "../audio/audio";
import { MidiTracks } from "../midi/midi";
import { RendererConfig } from "../renderers/renderer";

export function createRecorderResources(resources: {
  midiTracks?: MidiTracks;
  serializedAudio?: SerializedAudio;
  rendererConfig: RendererConfig;
  backgroundImageBitmap?: ImageBitmap;
}) {
  return resources;
}

export interface RecorderResources {
  readonly midiTracks: MidiTracks;
  readonly serializedAudio: SerializedAudio;
  readonly rendererConfig: RendererConfig;
  readonly backgroundImageBitmap?: ImageBitmap;
}

export type PartialRecorderResources = ReturnType<
  typeof createRecorderResources
>;
