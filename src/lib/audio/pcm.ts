// 16-bit storage halves resident PCM memory; both ends of the pipeline are
// lossy-compressed, so float precision is never consumed (see WebCodecs'
// sample format conversion rules for the 32768 scale)
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
