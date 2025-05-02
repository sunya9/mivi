import { MediaCompositor } from "@/lib/media-compositor/media-compositor";
import { MP4Muxer, WebMMuxer, MuxerOptions, Muxer } from "@/lib/muxer";
import { expose } from "comlink";
import { RecorderResources } from "./recorder-resources";

export async function startRecording(
  resources: RecorderResources,
  onProgress: (progress: number) => void,
) {
  const muxerOptions: MuxerOptions = {
    frameRate: resources.rendererConfig.fps,
    width: resources.rendererConfig.resolution.width,
    height: resources.rendererConfig.resolution.height,
    numberOfChannels: resources.serializedAudio.numberOfChannels,
    sampleRate: resources.serializedAudio.sampleRate,
  };
  const muxer: Muxer =
    resources.rendererConfig.format === "webm"
      ? new WebMMuxer(muxerOptions)
      : new MP4Muxer(muxerOptions);
  using mediaCompositor = new MediaCompositor(resources, muxer, onProgress);
  const response = await mediaCompositor.composite();
  return response;
}

expose({ startRecording });
