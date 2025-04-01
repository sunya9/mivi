import { MidiTracks } from "@/types/midi";
import { MediaCompositor } from "@/lib/MediaCompositor";
import { RendererConfig } from "@/types/renderer";
import { SerializedAudio } from "@/types/audio";
import { MP4Muxer, WebMMuxer, MuxerOptions, Muxer } from "@/lib/muxer";
import { expose } from "comlink";

export async function startRecording(
  canvas: OffscreenCanvas,
  rendererConfig: RendererConfig,
  midiTracks: MidiTracks,
  serializedAudio: SerializedAudio,
  onProgress: (progress: number) => void,
  onError: (error: Error) => void,
) {
  const muxerOptions: MuxerOptions = {
    frameRate: rendererConfig.fps,
    width: canvas.width,
    height: canvas.height,
    numberOfChannels: serializedAudio.numberOfChannels,
    sampleRate: serializedAudio.sampleRate,
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
    muxer,
    onProgress,
    onError,
  );
  const response = await mediaCompositor.composite();
  return response;
}

expose({ startRecording });
