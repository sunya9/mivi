import { expect, test } from "vitest";

import type { FrequencyData } from "@/lib/audio/audio-analyzer";
import { SpectrumEnvelope } from "@/lib/audio/spectrum-envelope";

function spectrum(value: number, binCount = 4): FrequencyData {
  return {
    frequencyData: new Uint8Array(binCount).fill(value),
    timeDomainData: new Uint8Array(binCount).fill(128),
    frequencyBinCount: binCount,
    nyquistFrequency: 22050,
  };
}

const attackTime = 100;
const releaseTime = 1000;

test("the first frame snaps to the target", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  expect(envelope.follow(spectrum(200), 0).frequencyData[0]).toBe(200);
});

test("rising values follow the attack time", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(0), 0);
  const { frequencyData } = envelope.follow(spectrum(255), 0.1);
  expect(frequencyData[0]).toBe(Math.round(255 * (1 - Math.exp(-1))));
});

test("falling values follow the release time", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255), 0);
  const { frequencyData } = envelope.follow(spectrum(0), 0.1);
  expect(frequencyData[0]).toBe(Math.round(255 * Math.exp(-0.1)));
});

test("the same elapsed time gives the same result regardless of frame rate", () => {
  const at60 = new SpectrumEnvelope({ attackTime, releaseTime });
  const at30 = new SpectrumEnvelope({ attackTime, releaseTime });
  at60.follow(spectrum(255), 0);
  at30.follow(spectrum(255), 0);
  for (let i = 1; i <= 6; i++) at60.follow(spectrum(0), i / 60);
  for (let i = 1; i <= 3; i++) at30.follow(spectrum(0), i / 30);
  expect(at60.follow(spectrum(0), 0.1).frequencyData[0]).toBe(
    at30.follow(spectrum(0), 0.1).frequencyData[0],
  );
});

test("a zero attack time rises instantly", () => {
  const envelope = new SpectrumEnvelope({ attackTime: 0, releaseTime });
  envelope.follow(spectrum(0), 0);
  expect(envelope.follow(spectrum(255), 0.001).frequencyData[0]).toBe(255);
});

test("the same time returns the current envelope unchanged", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255), 0);
  const first = envelope.follow(spectrum(0), 0.1).frequencyData[0];
  expect(envelope.follow(spectrum(0), 0.1).frequencyData[0]).toBe(first);
});

test.each([
  ["a backward jump", -0.1],
  ["a gap longer than a second", 1.5],
])("%s snaps to the target", (_, delta) => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255), 1);
  expect(envelope.follow(spectrum(0), 1 + delta).frequencyData[0]).toBe(0);
});

test("a change in bin count snaps to the target", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255, 4), 0);
  const { frequencyData } = envelope.follow(spectrum(0, 8), 0.1);
  expect(frequencyData).toHaveLength(8);
  expect(frequencyData[0]).toBe(0);
});

test("configure changes the times without resetting the envelope", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255), 0);
  envelope.configure({ attackTime, releaseTime: 0 });
  expect(envelope.follow(spectrum(0), 0.001).frequencyData[0]).toBe(0);
});

test("keeps the other fields of the target", () => {
  const envelope = new SpectrumEnvelope({ attackTime, releaseTime });
  envelope.follow(spectrum(255), 0);
  const target = spectrum(0);
  const result = envelope.follow(target, 0.1);
  expect(result.timeDomainData).toBe(target.timeDomainData);
  expect(result.frequencyBinCount).toBe(4);
  expect(result.nyquistFrequency).toBe(22050);
});
