import { MidiTracks } from "@/lib/midi/midi";
import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { RendererConfig } from "@/lib/renderers/renderer";
import { SerializedAudio } from "@/lib/audio";
import { MP4Muxer, WebMMuxer, MuxerOptions, Muxer } from "@/lib/muxer";
import { expose } from "comlink";

export async function startRecording(
  rendererConfig: RendererConfig,
  midiTracks: MidiTracks,
  serializedAudio: SerializedAudio,
  onProgress: (progress: number) => void,
) {
  const muxerOptions: MuxerOptions = {
    frameRate: rendererConfig.fps,
    width: rendererConfig.resolution.width,
    height: rendererConfig.resolution.height,
    numberOfChannels: serializedAudio.numberOfChannels,
    sampleRate: serializedAudio.sampleRate,
  };
  const muxer: Muxer =
    rendererConfig.format === "webm"
      ? new WebMMuxer(muxerOptions)
      : new MP4Muxer(muxerOptions);
  using mediaCompositor = new MediaCompositor(
    rendererConfig,
    midiTracks,
    serializedAudio,
    muxer,
    onProgress,
  );
  const response = await mediaCompositor.composite();
  return response;
}

expose({ startRecording });
