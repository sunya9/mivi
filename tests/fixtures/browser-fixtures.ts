import {
  AudioSample,
  AudioSampleSource,
  BufferTarget,
  Mp4OutputFormat,
  Output,
  WavOutputFormat,
} from "mediabunny";

import { SerializedAudio } from "@/lib/audio/audio";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { MidiTracks } from "@/lib/midi/midi";
import type { VideoFormat } from "@/lib/muxer/video-format";
import { RendererConfig, getDefaultRendererConfig } from "@/lib/renderers/renderer-config";

export function createTestSerializedAudio(duration = 0.5): SerializedAudio {
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const channels = [new Int16Array(length), new Int16Array(length)];

  for (let i = 0; i < length; i++) {
    channels[0][i] = Math.round(Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 16384);
    channels[1][i] = channels[0][i];
  }

  return { channels, duration, length, sampleRate, numberOfChannels: 2 };
}

export async function createTestAudioFile(
  serialized: SerializedAudio,
  audioTracks = 1,
): Promise<File> {
  const { channels, numberOfChannels, sampleRate, length } = serialized;
  const wav = audioTracks === 1;
  const target = new BufferTarget();
  const output = new Output({
    format: wav ? new WavOutputFormat() : new Mp4OutputFormat(),
    target,
  });
  const sources = Array.from({ length: audioTracks }, () => {
    const source = new AudioSampleSource({ codec: "pcm-s16" });
    output.addAudioTrack(source);
    return source;
  });
  await output.start();

  const data = new Int16Array(numberOfChannels * length);
  channels.forEach((channel, i) => data.set(channel, i * length));
  for (const source of sources) {
    // oxlint-disable-next-line no-await-in-loop
    await source.add(
      new AudioSample({ data, format: "s16-planar", numberOfChannels, sampleRate, timestamp: 0 }),
    );
  }
  await output.finalize();
  if (!target.buffer) throw new Error("Audio output was not finalized");
  return wav
    ? new File([target.buffer], "test.wav", { type: "audio/wav" })
    : new File([target.buffer], "test.m4a", { type: "audio/mp4" });
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

export async function createTestRecorderResources(
  format: VideoFormat,
  { duration = 0.5, audioTracks = 1 } = {},
): Promise<RecorderResources> {
  const serialized = createTestSerializedAudio(duration);
  const file = await createTestAudioFile(serialized, audioTracks);
  return {
    midiTracks: createTestMidiTracks(),
    audioSource: { name: file.name, file, serialized },
    rendererConfig: createTestRendererConfig(format),
  };
}
