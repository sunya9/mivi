import { MidiTracks } from "@/types/midi";
import { MediaCompositor, OnProgress } from "@/lib/MediaCompositor";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/atoms/playerAtom";

export async function startRecording(
  canvas: OffscreenCanvas,
  rendererConfig: RendererConfig,
  midiTracks: MidiTracks,
  serializedAudio: SerializedAudio,
  fps: number,
  duration: number,
  onProgress: OnProgress,
  onError: (error: Error) => void,
) {
  using mediaCompositor = new MediaCompositor(
    canvas,
    rendererConfig,
    midiTracks,
    serializedAudio,
    fps,
    duration,
    onProgress,
    onError,
  );
  const response = await mediaCompositor.composite();
  return response;
}

export function terminate() {}
