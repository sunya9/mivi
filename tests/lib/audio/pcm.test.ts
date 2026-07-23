import { test, expect } from "vitest";
import { floatToInt16, int16ToFloat } from "@/lib/audio/pcm";

test("floatToInt16 scales by 32768 and rounds", () => {
  expect(Array.from(floatToInt16(new Float32Array([0, 0.5, -0.5])))).toEqual([0, 16384, -16384]);
});

test("floatToInt16 clamps out-of-range samples", () => {
  expect(Array.from(floatToInt16(new Float32Array([1, -1, 1.5, -1.5])))).toEqual([
    32767, -32768, 32767, -32768,
  ]);
});

test("int16ToFloat divides by 32768", () => {
  expect(Array.from(int16ToFloat(new Int16Array([-32768, 0, 16384])))).toEqual([-1, 0, 0.5]);
});

test("roundtrip error stays within one quantization step", () => {
  const source = new Float32Array([0.1234, -0.9876, 0.5555, 0.9999]);
  const roundtrip = int16ToFloat(floatToInt16(source));
  for (let i = 0; i < source.length; i++) {
    expect(Math.abs(roundtrip[i] - source[i])).toBeLessThanOrEqual(1 / 32768);
  }
});
