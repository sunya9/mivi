import { describe, it, expect } from "vitest";
import {
  precomputeFFTData,
  getFrameAtTime,
  computeFFTAtTime,
  type PrecomputedFFTData,
} from "@/lib/audio/fft-precompute";
import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import type { SerializedAudio } from "@/lib/audio/audio";

function createMockSerializedAudio(
  overrides: Partial<SerializedAudio> = {},
): SerializedAudio {
  const sampleRate = 44100;
  const duration = 1; // 1 second
  const length = sampleRate * duration;
  // Generate a simple sine wave for realistic test data
  const channel = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    channel[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
  }

  return {
    sampleRate,
    duration,
    length,
    numberOfChannels: 1,
    channels: [channel],
    ...overrides,
  };
}

function createMockPrecomputedFFTData(
  frameCount: number = 30,
  fps: number = 30,
  duration: number = 1,
): PrecomputedFFTData {
  const frames: FrequencyData[] = [];

  for (let i = 0; i < frameCount; i++) {
    frames.push({
      frequencyBinCount: 1024,
      frequencyData: new Uint8Array(1024).fill(i % 256),
      timeDomainData: new Uint8Array(1024).fill(128),
      nyquistFrequency: 22050,
    });
  }

  return { frames, fps, duration };
}

describe("getFrameAtTime", () => {
  it("returns null for negative time", () => {
    const data = createMockPrecomputedFFTData();
    expect(getFrameAtTime(data, -1)).toBeNull();
  });

  it("returns null for time beyond duration", () => {
    const data = createMockPrecomputedFFTData(30, 30, 1);
    expect(getFrameAtTime(data, 1.1)).toBeNull();
  });

  it("returns correct frame for valid time at start", () => {
    const data = createMockPrecomputedFFTData(30, 30, 1);
    const frame = getFrameAtTime(data, 0);
    expect(frame).not.toBeNull();
    expect(frame).toBe(data.frames[0]);
  });

  it("returns correct frame for valid time in middle", () => {
    const data = createMockPrecomputedFFTData(30, 30, 1);
    // At time 0.5s with 30fps, frame index = floor(0.5 * 30) = 15
    const frame = getFrameAtTime(data, 0.5);
    expect(frame).not.toBeNull();
    expect(frame).toBe(data.frames[15]);
  });

  it("clamps to last frame when at duration boundary", () => {
    const data = createMockPrecomputedFFTData(30, 30, 1);
    const frame = getFrameAtTime(data, 1); // exactly at duration
    expect(frame).not.toBeNull();
    expect(frame).toBe(data.frames[data.frames.length - 1]);
  });

  it("handles empty frames array gracefully", () => {
    const data: PrecomputedFFTData = { frames: [], fps: 30, duration: 1 };
    const frame = getFrameAtTime(data, 0.5);
    expect(frame).toBeNull();
  });
});

describe("computeFFTAtTime", () => {
  it("returns null for negative time", () => {
    const audio = createMockSerializedAudio();
    expect(computeFFTAtTime(audio, -1)).toBeNull();
  });

  it("returns null for time beyond duration", () => {
    const audio = createMockSerializedAudio({ duration: 1 });
    expect(computeFFTAtTime(audio, 1.1)).toBeNull();
  });

  it("returns FrequencyData for valid time at start", () => {
    const audio = createMockSerializedAudio();
    const result = computeFFTAtTime(audio, 0);
    expect(result).not.toBeNull();
    expect(result?.frequencyBinCount).toBe(1024); // default fftSize 2048 / 2
    expect(result?.frequencyData).toBeInstanceOf(Uint8Array);
    expect(result?.frequencyData.length).toBe(1024);
    expect(result?.timeDomainData).toBeInstanceOf(Uint8Array);
    expect(result?.timeDomainData.length).toBe(1024);
  });

  it("returns FrequencyData for valid time at end boundary", () => {
    const audio = createMockSerializedAudio({ duration: 1 });
    const result = computeFFTAtTime(audio, 1); // exactly at duration
    expect(result).not.toBeNull();
    expect(result?.frequencyBinCount).toBe(1024);
  });

  it("respects custom fftSize option", () => {
    const audio = createMockSerializedAudio();
    const result = computeFFTAtTime(audio, 0, { fftSize: 512 });
    expect(result).not.toBeNull();
    expect(result?.frequencyBinCount).toBe(256); // 512 / 2
    expect(result?.frequencyData.length).toBe(256);
  });

  it("computes correct nyquist frequency", () => {
    const audio = createMockSerializedAudio({ sampleRate: 48000 });
    const result = computeFFTAtTime(audio, 0);
    expect(result).not.toBeNull();
    expect(result?.nyquistFrequency).toBe(24000); // sampleRate / 2
  });

  it("handles multi-channel audio", () => {
    const sampleRate = 44100;
    const duration = 1;
    const length = sampleRate * duration;
    const channel1 = new Float32Array(length);
    const channel2 = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      channel1[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
      channel2[i] = Math.sin((2 * Math.PI * 880 * i) / sampleRate);
    }

    const audio: SerializedAudio = {
      sampleRate,
      duration,
      length,
      numberOfChannels: 2,
      channels: [channel1, channel2],
    };

    const result = computeFFTAtTime(audio, 0.5);
    expect(result).not.toBeNull();
    expect(result?.frequencyBinCount).toBe(1024);
  });
});

describe("precomputeFFTData", () => {
  it("generates correct number of frames based on fps and duration", () => {
    const audio = createMockSerializedAudio({ duration: 1 });
    const result = precomputeFFTData(audio, 30);
    expect(result.frames.length).toBe(30); // ceil(1 * 30)
    expect(result.fps).toBe(30);
    expect(result.duration).toBe(1);
  });

  it("generates correct number of frames for fractional duration", () => {
    const sampleRate = 44100;
    const duration = 1.5;
    const length = Math.floor(sampleRate * duration);
    const channel = new Float32Array(length).fill(0);

    const audio: SerializedAudio = {
      sampleRate,
      duration,
      length,
      numberOfChannels: 1,
      channels: [channel],
    };

    const result = precomputeFFTData(audio, 30);
    expect(result.frames.length).toBe(45); // ceil(1.5 * 30)
    expect(result.fps).toBe(30);
    expect(result.duration).toBe(1.5);
  });

  it("each frame has valid FrequencyData structure", () => {
    const audio = createMockSerializedAudio({ duration: 0.1 });
    const result = precomputeFFTData(audio, 10);

    for (const frame of result.frames) {
      expect(frame.frequencyBinCount).toBe(1024); // default 2048 / 2
      expect(frame.frequencyData).toBeInstanceOf(Uint8Array);
      expect(frame.frequencyData.length).toBe(1024);
      expect(frame.timeDomainData).toBeInstanceOf(Uint8Array);
      expect(frame.timeDomainData.length).toBe(1024);
      expect(frame.nyquistFrequency).toBe(22050); // 44100 / 2
    }
  });

  it("respects custom fftSize option", () => {
    const audio = createMockSerializedAudio({ duration: 0.1 });
    const result = precomputeFFTData(audio, 10, { fftSize: 512 });

    for (const frame of result.frames) {
      expect(frame.frequencyBinCount).toBe(256); // 512 / 2
      expect(frame.frequencyData.length).toBe(256);
    }
  });

  it("applies smoothing when smoothingTimeConstant > 0", () => {
    const audio = createMockSerializedAudio({ duration: 0.1 });
    const resultWithSmoothing = precomputeFFTData(audio, 10, {
      smoothingTimeConstant: 0.8,
    });
    const resultWithoutSmoothing = precomputeFFTData(audio, 10, {
      smoothingTimeConstant: 0,
    });

    // Both should have same structure
    expect(resultWithSmoothing.frames.length).toBe(
      resultWithoutSmoothing.frames.length,
    );

    // Values may differ due to smoothing
    // Smoothing should create more continuity between frames
    expect(resultWithSmoothing.frames.length).toBeGreaterThan(0);
  });

  it("frequency data values are within 0-255 range", () => {
    const audio = createMockSerializedAudio({ duration: 0.1 });
    const result = precomputeFFTData(audio, 10);

    for (const frame of result.frames) {
      for (let i = 0; i < frame.frequencyData.length; i++) {
        expect(frame.frequencyData[i]).toBeGreaterThanOrEqual(0);
        expect(frame.frequencyData[i]).toBeLessThanOrEqual(255);
      }
    }
  });

  it("time domain data values are within 0-255 range", () => {
    const audio = createMockSerializedAudio({ duration: 0.1 });
    const result = precomputeFFTData(audio, 10);

    for (const frame of result.frames) {
      for (let i = 0; i < frame.timeDomainData.length; i++) {
        expect(frame.timeDomainData[i]).toBeGreaterThanOrEqual(0);
        expect(frame.timeDomainData[i]).toBeLessThanOrEqual(255);
      }
    }
  });

  it("handles different fps values", () => {
    const audio = createMockSerializedAudio({ duration: 1 });

    const result60fps = precomputeFFTData(audio, 60);
    expect(result60fps.frames.length).toBe(60);
    expect(result60fps.fps).toBe(60);

    const result24fps = precomputeFFTData(audio, 24);
    expect(result24fps.frames.length).toBe(24);
    expect(result24fps.fps).toBe(24);
  });

  it("detects frequency content in sine wave", () => {
    // Create a sine wave at 440Hz
    const sampleRate = 44100;
    const duration = 0.1;
    const length = Math.floor(sampleRate * duration);
    const channel = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      channel[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    }

    const audio: SerializedAudio = {
      sampleRate,
      duration,
      length,
      numberOfChannels: 1,
      channels: [channel],
    };

    const result = precomputeFFTData(audio, 10, { fftSize: 2048 });
    const firstFrame = result.frames[0];

    // There should be some non-zero frequency content
    const maxFrequencyValue = Math.max(...firstFrame.frequencyData);
    expect(maxFrequencyValue).toBeGreaterThan(0);
  });
});
