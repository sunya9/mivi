import { expect, test } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { calculateBandAmplitudes } from "@/lib/renderers/audio-visualizer/band-amplitudes";

function createFrequencyData(fill: (bin: number) => number): FrequencyData {
  const frequencyBinCount = 1024;
  const frequencyData = new Uint8Array(frequencyBinCount);
  for (let i = 0; i < frequencyBinCount; i++) {
    frequencyData[i] = fill(i);
  }
  return {
    frequencyData,
    timeDomainData: new Uint8Array(frequencyBinCount),
    frequencyBinCount,
    nyquistFrequency: 22050,
  };
}

const binWidthHz = 22050 / 1024;

test("a band narrower than one bin interpolates between the neighboring bins", () => {
  const data = createFrequencyData((bin) => (bin === 1 ? 200 : 0));
  const [amplitude] = calculateBandAmplitudes(data, 1, binWidthHz * 0.4, binWidthHz * 0.6);
  expect(amplitude).toBeCloseTo(100, 5);
});

test("adjacent narrow bands never share the same value on a ramp spectrum", () => {
  const data = createFrequencyData((bin) => Math.min(255, bin * 10));
  const amplitudes = calculateBandAmplitudes(data, 64, 20, 20000);
  for (let i = 1; i < 20; i++) {
    expect(amplitudes[i]).toBeGreaterThan(amplitudes[i - 1]);
  }
});

test("a band spanning several bins averages the covered bins", () => {
  const data = createFrequencyData((bin) => (bin >= 90 && bin <= 210 ? 100 : 0));
  const [amplitude] = calculateBandAmplitudes(data, 1, binWidthHz * 100, binWidthHz * 200);
  expect(amplitude).toBeCloseTo(100, 5);
});

test("a band ending at the nyquist frequency stays within the bin count", () => {
  const data = createFrequencyData(() => 50);
  const amplitudes = calculateBandAmplitudes(data, 4, 20000, 22050);
  expect(amplitudes).toHaveLength(4);
  for (const amplitude of amplitudes) {
    expect(amplitude).toBeCloseTo(50, 5);
  }
});

test("returns one amplitude per band", () => {
  const data = createFrequencyData(() => 0);
  expect(calculateBandAmplitudes(data, 32, 20, 20000)).toHaveLength(32);
});
