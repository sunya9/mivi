export function floatToInt16(samples: Float32Array): Int16Array {
  const result = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    result[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768)));
  }
  return result;
}

export function int16ToFloat(samples: Int16Array): Float32Array {
  const result = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    result[i] = samples[i] / 32768;
  }
  return result;
}
