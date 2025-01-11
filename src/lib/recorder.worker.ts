import { MidiState } from "@/types/midi";
import { SerializedAudio } from "@/lib/AudioHandler";
import { MediaCompositor, OnProgress } from "@/lib/MediaCompositor";
import { RendererConfig } from "@/types/renderer";

export async function startRecording(
  canvas: OffscreenCanvas,
  rendererConfig: RendererConfig,
  midiState: MidiState,
  serializedAudio: SerializedAudio,
  fps: number,
  onProgress: OnProgress,
  onError: (error: Error) => void,
) {
  using mediaCompositor = new MediaCompositor(
    canvas,
    rendererConfig,
    midiState,
    serializedAudio,
    fps,
    onProgress,
    onError,
  );
  const response = await mediaCompositor.composite();
  return response;
}

export function terminate() {}
