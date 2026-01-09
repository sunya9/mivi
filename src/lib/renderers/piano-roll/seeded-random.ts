/**
 * Mulberry32-based hash function for seeded random number generation.
 * Fast and produces well-distributed values in [0, 1).
 *
 * @param seed - Any integer value used as the seed
 * @returns A pseudo-random number between 0 (inclusive) and 1 (exclusive)
 */
export function seededRandom(seed: number): number {
  // Mulberry32 algorithm (single iteration as hash)
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
