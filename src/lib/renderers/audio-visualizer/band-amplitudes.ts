import type { FrequencyData } from "@/lib/audio/audio-analyzer";

/**
 * Average frequency bins into log-spaced bands between minFrequency and maxFrequency.
 * Returns one amplitude (0-255) per band.
 */
export function calculateBandAmplitudes(
  frequencyData: FrequencyData,
  bandCount: number,
  minFrequency: number,
  maxFrequency: number,
): number[] {
  const { frequencyData: data, frequencyBinCount, nyquistFrequency } = frequencyData;
  const binsPerHz = frequencyBinCount / nyquistFrequency;
  const logMin = Math.log10(minFrequency);
  const logStep = (Math.log10(maxFrequency) - logMin) / bandCount;

  const result: number[] = [];
  for (let i = 0; i < bandCount; i++) {
    const binStart = Math.pow(10, logMin + i * logStep) * binsPerHz;
    const binEnd = Math.pow(10, logMin + (i + 1) * logStep) * binsPerHz;
    // Low bands are narrower than a bin, so several of them would otherwise
    // read the same bin and form plateaus; sample the spectrum between bins instead
    result.push(
      binEnd - binStart < 1
        ? interpolateBin(data, frequencyBinCount, (binStart + binEnd) / 2)
        : averageBins(data, frequencyBinCount, binStart, binEnd),
    );
  }
  return result;
}

function interpolateBin(data: Uint8Array, binCount: number, position: number): number {
  const lower = Math.min(Math.floor(position), binCount - 1);
  const upper = Math.min(lower + 1, binCount - 1);
  const t = position - lower;
  return data[lower] * (1 - t) + data[upper] * t;
}

function averageBins(data: Uint8Array, binCount: number, binStart: number, binEnd: number): number {
  let sum = 0;
  let count = 0;
  for (let j = Math.max(0, Math.floor(binStart)); j < Math.min(binCount, Math.ceil(binEnd)); j++) {
    sum += data[j];
    count++;
  }
  return count > 0 ? sum / count : 0;
}
