import { AudioSample, AudioSampleSource, BufferTarget, Output, WavOutputFormat } from "mediabunny";

import { SerializedAudio } from "@/lib/audio/audio";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MidiTracks } from "@/lib/midi/midi";
import type { VideoFormat } from "@/lib/muxer/video-format";
import { RendererConfig, getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

export function createTestSerializedAudio(): SerializedAudio {
  const sampleRate = 44100;
  const duration = 0.5;
  const length = Math.floor(sampleRate * duration);
  const channels = [new Int16Array(length), new Int16Array(length)];

  for (let i = 0; i < length; i++) {
    channels[0][i] = Math.round(Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 16384);
    channels[1][i] = channels[0][i];
  }

  return { channels, duration, length, sampleRate, numberOfChannels: 2 };
}

export async function createTestAudioFile(serialized: SerializedAudio): Promise<File> {
  const { channels, numberOfChannels, sampleRate, length } = serialized;
  const target = new BufferTarget();
  const output = new Output({ format: new WavOutputFormat(), target });
  const source = new AudioSampleSource({ codec: "pcm-s16" });
  output.addAudioTrack(source);
  await output.start();

  const data = new Int16Array(numberOfChannels * length);
  channels.forEach((channel, i) => data.set(channel, i * length));
  await source.add(
    new AudioSample({ data, format: "s16-planar", numberOfChannels, sampleRate, timestamp: 0 }),
  );
  await output.finalize();
  if (!target.buffer) throw new Error("WAV output was not finalized");
  return new File([target.buffer], "test.wav", { type: "audio/wav" });
}

export function createTestMidiTracks(): MidiTracks {
  return {
    hash: "test-hash",
    instanceKey: "test-instance",
    duration: 0.5,
    minNote: 60,
    maxNote: 72,
    name: "test.mid",
    midiOffset: 0,
    tracks: [
      {
        id: "0",
        sourceIndex: 0,
        config: {
          color: "#ff0000",
          name: "Test",
          opacity: 1,
          scale: 1,
          staccato: false,
          visible: true,
        },
        notes: [
          {
            id: 0,
            duration: 0.5,
            durationTicks: 480,
            midi: 60,
            name: "C4",
            ticks: 0,
            time: 0,
            velocity: 1,
          },
        ],
      },
    ],
  };
}

function createTestRendererConfig(format: VideoFormat): RendererConfig {
  const config = getDefaultRendererConfig();
  return {
    ...config,
    resolution: { width: 320, height: 240, label: "320×240 (4:3)" },
    fps: 24,
    format,
  };
}

export async function createTestRecorderResources(format: VideoFormat): Promise<RecorderResources> {
  const serialized = createTestSerializedAudio();
  return {
    midiTracks: createTestMidiTracks(),
    audioSource: {
      name: "test.wav",
      file: await createTestAudioFile(serialized),
      serialized,
    },
    rendererConfig: createTestRendererConfig(format),
  };
}
