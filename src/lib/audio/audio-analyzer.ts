/**
 * Represents frequency and time-domain data from audio analysis.
 */
export interface FrequencyData {
  /** Number of frequency bins (half of fftSize) */
  readonly frequencyBinCount: number;
  /** Frequency magnitude data (0-255) */
  readonly frequencyData: Uint8Array<ArrayBuffer>;
  /** Time-domain waveform data (0-255) */
  readonly timeDomainData: Uint8Array<ArrayBuffer>;
  /** Nyquist frequency (half of sample rate) */
  readonly nyquistFrequency: number;
}

export type FFTSize = 256 | 512 | 1024 | 2048 | 4096 | 8192;

export interface AudioAnalyzerOptions {
  fftSize?: FFTSize;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

const DEFAULT_FFT_SIZE: FFTSize = 2048;
const DEFAULT_SMOOTHING_TIME_CONSTANT = 0.8;
const DEFAULT_MIN_DECIBELS = -100;
const DEFAULT_MAX_DECIBELS = -30;

/**
 * Wrapper for Web Audio AnalyserNode providing frequency analysis capabilities.
 * Manages frequency and time-domain data buffers for real-time audio visualization.
 */
export class AudioAnalyzer {
  readonly #analyser: AnalyserNode;
  readonly #frequencyData: Uint8Array<ArrayBuffer>;
  readonly #timeDomainData: Uint8Array<ArrayBuffer>;
  readonly #nyquistFrequency: number;

  constructor(audioContext: AudioContext, options: AudioAnalyzerOptions = {}) {
    const {
      fftSize = DEFAULT_FFT_SIZE,
      smoothingTimeConstant = DEFAULT_SMOOTHING_TIME_CONSTANT,
      minDecibels = DEFAULT_MIN_DECIBELS,
      maxDecibels = DEFAULT_MAX_DECIBELS,
    } = options;

    this.#analyser = audioContext.createAnalyser();
    this.#analyser.fftSize = fftSize;
    this.#analyser.smoothingTimeConstant = smoothingTimeConstant;
    this.#analyser.minDecibels = minDecibels;
    this.#analyser.maxDecibels = maxDecibels;

    this.#frequencyData = new Uint8Array(this.#analyser.frequencyBinCount);
    this.#timeDomainData = new Uint8Array(this.#analyser.frequencyBinCount);
    this.#nyquistFrequency = audioContext.sampleRate / 2;
  }

  /** Get the underlying AnalyserNode for connecting to audio graph */
  get node(): AnalyserNode {
    return this.#analyser;
  }

  /** Get current FFT size */
  get fftSize(): number {
    return this.#analyser.fftSize;
  }

  /** Set FFT size */
  set fftSize(value: FFTSize) {
    if (this.#analyser.fftSize !== value) {
      this.#analyser.fftSize = value;
      // Note: frequencyBinCount changes, but we keep existing buffers
      // They will be reallocated on next getFrequencyData call if needed
    }
  }

  /** Get smoothing time constant */
  get smoothingTimeConstant(): number {
    return this.#analyser.smoothingTimeConstant;
  }

  /** Set smoothing time constant (0-1) */
  set smoothingTimeConstant(value: number) {
    this.#analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
  }

  /** Get minimum decibels */
  get minDecibels(): number {
    return this.#analyser.minDecibels;
  }

  /** Set minimum decibels */
  set minDecibels(value: number) {
    this.#analyser.minDecibels = value;
  }

  /** Get maximum decibels */
  get maxDecibels(): number {
    return this.#analyser.maxDecibels;
  }

  /** Set maximum decibels */
  set maxDecibels(value: number) {
    this.#analyser.maxDecibels = value;
  }

  /**
   * Get current frequency and time-domain data.
   * Updates internal buffers and returns a snapshot.
   */
  getFrequencyData(): FrequencyData {
    const binCount = this.#analyser.frequencyBinCount;

    // Ensure buffers are correct size (in case fftSize was changed)
    const frequencyData: Uint8Array<ArrayBuffer> =
      this.#frequencyData.length === binCount
        ? this.#frequencyData
        : new Uint8Array(binCount);
    const timeDomainData: Uint8Array<ArrayBuffer> =
      this.#timeDomainData.length === binCount
        ? this.#timeDomainData
        : new Uint8Array(binCount);

    this.#analyser.getByteFrequencyData(frequencyData);
    this.#analyser.getByteTimeDomainData(timeDomainData);

    return {
      frequencyBinCount: binCount,
      frequencyData,
      timeDomainData,
      nyquistFrequency: this.#nyquistFrequency,
    };
  }

  /**
   * Convert a frequency bin index to its corresponding frequency in Hz.
   */
  binToFrequency(binIndex: number): number {
    return (
      (binIndex / this.#analyser.frequencyBinCount) * this.#nyquistFrequency
    );
  }

  /**
   * Convert a frequency in Hz to its corresponding bin index.
   */
  frequencyToBin(frequency: number): number {
    return Math.round(
      (frequency / this.#nyquistFrequency) * this.#analyser.frequencyBinCount,
    );
  }

  /**
   * Get frequency data for a specific frequency range.
   * Useful for isolating bass, mid, or treble frequencies.
   */
  getFrequencyRangeData(
    minFrequency: number,
    maxFrequency: number,
  ): Uint8Array {
    const data = this.getFrequencyData();
    const startBin = this.frequencyToBin(minFrequency);
    const endBin = this.frequencyToBin(maxFrequency);
    return data.frequencyData.slice(startBin, endBin + 1);
  }

  /**
   * Get the average amplitude across all frequency bins.
   * Useful for overall volume/intensity visualization.
   */
  getAverageFrequency(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.frequencyData.length; i++) {
      sum += data.frequencyData[i];
    }
    return sum / data.frequencyData.length;
  }
}
