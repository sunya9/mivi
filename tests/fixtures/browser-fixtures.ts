import { MidiTracks } from "@/lib/midi/midi";
import { RendererConfig, VideoFormat } from "@/lib/renderers/renderer";
import { getDefaultRendererConfig } from "@/lib/renderers/renderer";
import { RecorderResources } from "@/lib/media-compositor/recorder-resources";
import { SerializedAudio } from "@/lib/audio/audio";

export function createTestSerializedAudio(): SerializedAudio {
  const sampleRate = 44100;
  const duration = 0.5;
  const length = Math.floor(sampleRate * duration);
  const channels = [new Float32Array(length), new Float32Array(length)];

  for (let i = 0; i < length; i++) {
    channels[0][i] = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.5;
    channels[1][i] = channels[0][i];
  }

  return { channels, duration, length, sampleRate, numberOfChannels: 2 };
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

export function createTestRecorderResources(
  format: VideoFormat,
): RecorderResources {
  return {
    midiTracks: createTestMidiTracks(),
    serializedAudio: createTestSerializedAudio(),
    rendererConfig: createTestRendererConfig(format),
  };
}
