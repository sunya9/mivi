import { Input, ALL_FORMATS, BlobSource, AudioSampleSink } from "mediabunny";
import { expose } from "comlink";
import type { StoredAudioData } from "./audio";

export async function decodeAudio(file: File): Promise<StoredAudioData> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  // Resolve the demuxer outside the try/finally: mediabunny's Input#dispose()
  // re-chains on the cached demuxer promise without a .catch, leaking an
  // unhandled rejection if format detection failed. So we only dispose once
  // we know the demuxer was initialized successfully.
  const audioTrack = await input.getPrimaryAudioTrack();
  if (!audioTrack) {
    input.dispose();
    throw new Error("No audio track found in file");
  }
  try {
    const [sampleRate, numberOfChannels] = await Promise.all([
      audioTrack.getSampleRate(),
      audioTrack.getNumberOfChannels(),
    ]);
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
  } finally {
    input.dispose();
  }
}

expose({ decodeAudio });
