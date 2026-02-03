import type { FrequencyData, FFTSize } from "./audio-analyzer";
import type { SerializedAudio } from "./audio";

export interface PrecomputedFFTData {
  /** Pre-computed frequency data for each frame */
  readonly frames: FrequencyData[];
  /** Frame rate used for pre-computation */
  readonly fps: number;
  /** Total duration in seconds */
  readonly duration: number;
}

export interface FFTPrecomputeOptions {
  fftSize?: FFTSize;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  onProgress?: (current: number, total: number) => void;
}

const DEFAULT_FFT_SIZE: FFTSize = 2048;
const DEFAULT_SMOOTHING_TIME_CONSTANT = 0.8;
const DEFAULT_MIN_DECIBELS = -100;
const DEFAULT_MAX_DECIBELS = -30;

/**
 * Pre-compute frequency data for video export using pure JavaScript FFT.
 * This allows audio visualization in exported videos without real-time playback.
 * Works in Web Workers (no Web Audio API dependency).
 */
export function precomputeFFTData(
  serializedAudio: SerializedAudio,
  fps: number,
  options: FFTPrecomputeOptions = {},
): PrecomputedFFTData {
  const {
    fftSize = DEFAULT_FFT_SIZE,
    smoothingTimeConstant = DEFAULT_SMOOTHING_TIME_CONSTANT,
    minDecibels = DEFAULT_MIN_DECIBELS,
    maxDecibels = DEFAULT_MAX_DECIBELS,
  } = options;

  const { sampleRate, numberOfChannels, duration, channels, length } =
    serializedAudio;

  console.log("[precomputeFFTData] Input:", {
    sampleRate,
    numberOfChannels,
    duration,
    length,
    channelsLength: channels.length,
    firstChannelLength: channels[0]?.length,
  });

  const totalFrames = Math.ceil(duration * fps);
  const samplesPerFrame = Math.floor(sampleRate / fps);
  const frequencyBinCount = fftSize / 2;
  const nyquistFrequency = sampleRate / 2;

  console.log("[precomputeFFTData] Calculated:", {
    totalFrames,
    samplesPerFrame,
    frequencyBinCount,
    nyquistFrequency,
  });

  const frames: FrequencyData[] = [];

  // Process audio frame by frame directly from serialized channels
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const startSample = frameIndex * samplesPerFrame;
    const endSample = Math.min(startSample + fftSize, length);

    // Extract samples for this frame (mono mix from all channels)
    const samples = new Float32Array(fftSize);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = channels[channel];
      for (let i = 0; i < Math.min(fftSize, endSample - startSample); i++) {
        samples[i] += channelData[startSample + i] / numberOfChannels;
      }
    }

    // Compute FFT using pure JavaScript DFT
    const frequencyData = computeFrequencyData(
      samples,
      fftSize,
      minDecibels,
      maxDecibels,
    );

    // Create time domain data (simplified - just the samples normalized to 0-255)
    const timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(
      frequencyBinCount,
    );
    for (let i = 0; i < frequencyBinCount && i < fftSize; i++) {
      // Convert -1..1 to 0..255
      timeDomainData[i] = Math.round((samples[i] + 1) * 127.5);
    }

    frames.push({
      frequencyBinCount,
      frequencyData,
      timeDomainData,
      nyquistFrequency,
    });

    if (frameIndex === 0) {
      console.log("[precomputeFFTData] First frame:", {
        startSample,
        endSample,
        samplesExtracted: Math.min(fftSize, endSample - startSample),
        sampleRange: [
          samples[0],
          samples[Math.floor(fftSize / 2)],
          samples[fftSize - 1],
        ],
        frequencyDataSample: Array.from(frequencyData.slice(0, 10)),
      });
    }

    // Log progress every 100 frames
    if (frameIndex % 100 === 0) {
      console.log(
        `[precomputeFFTData] Progress: ${frameIndex}/${totalFrames} frames`,
      );
    }

    // Report progress to callback
    options.onProgress?.(frameIndex + 1, totalFrames);
  }

  console.log("[precomputeFFTData] Complete:", {
    totalFramesGenerated: frames.length,
  });

  // Apply smoothing between frames (simulating smoothingTimeConstant)
  if (smoothingTimeConstant > 0) {
    applySmoothing(frames, smoothingTimeConstant);
  }

  return {
    frames,
    fps,
    duration,
  };
}

/**
 * Compute frequency data using Cooley-Tukey FFT algorithm.
 * O(n log n) complexity instead of O(n²) DFT.
 */
function computeFrequencyData(
  samples: Float32Array,
  fftSize: number,
  minDecibels: number,
  maxDecibels: number,
): Uint8Array<ArrayBuffer> {
  const frequencyBinCount = fftSize / 2;
  const frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(
    frequencyBinCount,
  );

  // Apply Hann window
  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    real[i] = samples[i] * window;
    imag[i] = 0;
  }

  // Perform in-place FFT
  fft(real, imag);

  // Compute magnitude spectrum
  const decibelRange = maxDecibels - minDecibels;

  for (let k = 0; k < frequencyBinCount; k++) {
    // Compute magnitude
    const magnitude =
      Math.sqrt(real[k] * real[k] + imag[k] * imag[k]) / fftSize;

    // Convert to decibels
    const db = magnitude > 0 ? 20 * Math.log10(magnitude) : minDecibels;

    // Normalize to 0-255 based on decibel range
    const normalized = Math.max(
      0,
      Math.min(1, (db - minDecibels) / decibelRange),
    );
    frequencyData[k] = Math.round(normalized * 255);
  }

  return frequencyData;
}

/**
 * In-place Cooley-Tukey FFT algorithm.
 * Assumes input length is a power of 2.
 */
function fft(real: Float32Array, imag: Float32Array): void {
  const n = real.length;

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      // Swap real[i] and real[j]
      let temp = real[i];
      real[i] = real[j];
      real[j] = temp;
      // Swap imag[i] and imag[j]
      temp = imag[i];
      imag[i] = imag[j];
      imag[j] = temp;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey iterative FFT
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angleStep = (-2 * Math.PI) / len;

    for (let i = 0; i < n; i += len) {
      let angle = 0;
      for (let k = 0; k < halfLen; k++) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const idx1 = i + k;
        const idx2 = i + k + halfLen;

        const tReal = real[idx2] * cos - imag[idx2] * sin;
        const tImag = real[idx2] * sin + imag[idx2] * cos;

        real[idx2] = real[idx1] - tReal;
        imag[idx2] = imag[idx1] - tImag;
        real[idx1] = real[idx1] + tReal;
        imag[idx1] = imag[idx1] + tImag;

        angle += angleStep;
      }
    }
  }
}

/**
 * Apply temporal smoothing between frames.
 */
function applySmoothing(
  frames: FrequencyData[],
  smoothingTimeConstant: number,
): void {
  for (let i = 1; i < frames.length; i++) {
    const prevFrame = frames[i - 1];
    const currentFrame = frames[i];

    for (let j = 0; j < currentFrame.frequencyData.length; j++) {
      // Apply exponential smoothing: new = α * current + (1 - α) * previous
      const smoothed =
        smoothingTimeConstant * prevFrame.frequencyData[j] +
        (1 - smoothingTimeConstant) * currentFrame.frequencyData[j];
      currentFrame.frequencyData[j] = Math.round(smoothed);
    }
  }
}

/**
 * Get frequency data for a specific time in the pre-computed data.
 */
export function getFrameAtTime(
  precomputedData: PrecomputedFFTData,
  time: number,
): FrequencyData | null {
  if (time < 0 || time > precomputedData.duration) {
    return null;
  }

  const frameIndex = Math.floor(time * precomputedData.fps);
  const clampedIndex = Math.min(frameIndex, precomputedData.frames.length - 1);

  return precomputedData.frames[clampedIndex] ?? null;
}

/**
 * Compute FFT data for a single time position on-demand.
 * Useful for seek-time visualization without pre-computing all frames.
 */
export function computeFFTAtTime(
  serializedAudio: SerializedAudio,
  time: number,
  options: FFTPrecomputeOptions = {},
): FrequencyData | null {
  const {
    fftSize = DEFAULT_FFT_SIZE,
    minDecibels = DEFAULT_MIN_DECIBELS,
    maxDecibels = DEFAULT_MAX_DECIBELS,
  } = options;

  const { sampleRate, numberOfChannels, duration, channels, length } =
    serializedAudio;

  // Validate time
  if (time < 0 || time > duration) {
    return null;
  }

  const frequencyBinCount = fftSize / 2;
  const nyquistFrequency = sampleRate / 2;

  // Calculate the sample position for this time
  const startSample = Math.floor(time * sampleRate);
  const endSample = Math.min(startSample + fftSize, length);

  // Extract samples (mono mix from all channels)
  const samples = new Float32Array(fftSize);
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = channels[channel];
    for (let i = 0; i < Math.min(fftSize, endSample - startSample); i++) {
      samples[i] += channelData[startSample + i] / numberOfChannels;
    }
  }

  // Compute FFT
  const frequencyData = computeFrequencyData(
    samples,
    fftSize,
    minDecibels,
    maxDecibels,
  );

  // Create time domain data
  const timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(
    frequencyBinCount,
  );
  for (let i = 0; i < frequencyBinCount && i < fftSize; i++) {
    timeDomainData[i] = Math.round((samples[i] + 1) * 127.5);
  }

  return {
    frequencyBinCount,
    frequencyData,
    timeDomainData,
    nyquistFrequency,
  };
}
