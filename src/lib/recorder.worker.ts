import { MidiTracks } from "@/types/midi";
import { MediaCompositor, OnProgress } from "@/lib/MediaCompositor";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/atoms/playerAtom";
import { MP4Muxer, WebMMuxer, MuxerOptions, Muxer } from "@/lib/muxer";
import { ArrayBufferTarget } from "webm-muxer";

export async function startRecording(
  canvas: OffscreenCanvas,
  rendererConfig: RendererConfig,
  midiTracks: MidiTracks,
  serializedAudio: SerializedAudio,
  duration: number,
  onProgress: OnProgress,
  onError: (error: Error) => void,
) {
  const muxerOptions: MuxerOptions = {
    frameRate: rendererConfig.fps,
    width: canvas.width,
    height: canvas.height,
    numberOfChannels: serializedAudio.numberOfChannels,
    sampleRate: serializedAudio.sampleRate,
    target: new ArrayBufferTarget(),
  };
  const muxer: Muxer =
    rendererConfig.format === "webm"
      ? new WebMMuxer(muxerOptions)
      : new MP4Muxer(muxerOptions);
  using mediaCompositor = new MediaCompositor(
    canvas,
    rendererConfig,
    midiTracks,
    serializedAudio,
    rendererConfig.fps,
    duration,
    muxer,
    onProgress,
    onError,
  );
  const response = await mediaCompositor.composite();
  return response;
}

export function terminate() {}
