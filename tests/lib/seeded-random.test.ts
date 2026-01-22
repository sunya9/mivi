import { describe, it, expect } from "vitest";
import { seededRandom } from "@/lib/seeded-random";

describe("seededRandom", () => {
  it("returns the same value for the same seed", () => {
    const seed = 12345;
    const result1 = seededRandom(seed);
    const result2 = seededRandom(seed);
    expect(result1).toBe(result2);
  });

  it("returns different values for different seeds", () => {
    const result1 = seededRandom(1);
    const result2 = seededRandom(2);
    expect(result1).not.toBe(result2);
  });

  it("returns values in range [0, 1)", () => {
    const seeds = [0, 1, 100, 1000, 12345, -1, -100];
    for (const seed of seeds) {
      const result = seededRandom(seed);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    }
  });

  it("produces well-distributed values", () => {
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) {
      results.add(seededRandom(i));
    }
    expect(results.size).toBe(100);
  });
});
