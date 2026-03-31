import { Input, ALL_FORMATS, BlobSource, AudioSampleSink } from "mediabunny";
import { expose } from "comlink";
import type { StoredAudioData } from "./audio";

export async function decodeAudio(file: File): Promise<StoredAudioData> {
  using input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const audioTrack = await input.getPrimaryAudioTrack();
  if (!audioTrack) {
    throw new Error("No audio track found in file");
  }

  const { sampleRate, numberOfChannels } = audioTrack;
  const sink = new AudioSampleSink(audioTrack);

  const channelChunks: Float32Array[][] = Array.from({ length: numberOfChannels }, () => []);
  let totalFrames = 0;

  for await (const sample of sink.samples()) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const byteLength = sample.allocationSize({ planeIndex: ch, format: "f32-planar" });
      const data = new Float32Array(byteLength / 4);
      sample.copyTo(data, { planeIndex: ch, format: "f32-planar" });
      channelChunks[ch].push(data);
    }
    totalFrames += sample.numberOfFrames;
    sample.close();
  }

  const channels = channelChunks.map((chunks) => {
    const merged = new Float32Array(totalFrames);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  });

  return { channels, sampleRate, length: totalFrames, numberOfChannels };
}

expose({ decodeAudio });
