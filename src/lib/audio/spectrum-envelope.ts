import type { FrequencyData } from "./audio-analyzer";

export interface SpectrumEnvelopeOptions {
  /** Time (ms) for a rising bin to cover ~63% of the way to its target */
  attackTime: number;
  /** Time (ms) for a falling bin to cover ~63% of the way to its target */
  releaseTime: number;
}

export const DEFAULT_SPECTRUM_ENVELOPE: SpectrumEnvelopeOptions = {
  attackTime: 40,
  releaseTime: 250,
};

// A gap this long means a seek or a stalled loop; catching up gradually would look like lag
const MAX_GAP_SECONDS = 1;

/**
 * Time-based attack/release follower for spectrum frames, so the preview (rAF)
 * and the export (video fps) decay at the same real-time rate.
 */
export class SpectrumEnvelope {
  #options: SpectrumEnvelopeOptions;
  #values: Float32Array | null = null;
  #lastTime = 0;

  constructor(options: SpectrumEnvelopeOptions) {
    this.#options = options;
  }

  configure(options: SpectrumEnvelopeOptions): void {
    this.#options = options;
  }

  /** Advance the envelope toward `target` at `time` (seconds) and return the smoothed frame */
  follow(target: FrequencyData, time: number): FrequencyData {
    const { frequencyData: data, frequencyBinCount } = target;
    const elapsed = time - this.#lastTime;
    const values = this.#values;
    if (
      values === null ||
      values.length !== frequencyBinCount ||
      elapsed < 0 ||
      elapsed > MAX_GAP_SECONDS
    ) {
      this.#values = Float32Array.from(data);
      this.#lastTime = time;
      return target;
    }

    if (elapsed > 0) {
      const attack = coefficient(elapsed, this.#options.attackTime);
      const release = coefficient(elapsed, this.#options.releaseTime);
      for (let i = 0; i < frequencyBinCount; i++) {
        const current = values[i];
        const next = data[i];
        values[i] = current + (next - current) * (next > current ? attack : release);
      }
      this.#lastTime = time;
    }

    const frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(frequencyBinCount);
    for (let i = 0; i < frequencyBinCount; i++) {
      frequencyData[i] = Math.round(values[i]);
    }
    return { ...target, frequencyData };
  }
}

function coefficient(elapsedSeconds: number, timeMs: number): number {
  return timeMs <= 0 ? 1 : 1 - Math.exp(-(elapsedSeconds * 1000) / timeMs);
}
