import { describe, it, expect } from "vitest";
import { hashArrayBuffer } from "@/lib/hash";

describe("hashArrayBuffer", () => {
  it("should return a SHA-256 hash as a hex string", async () => {
    const buffer = new TextEncoder().encode("hello world").buffer;
    const hash = await hashArrayBuffer(buffer);

    // SHA-256 hash of "hello world"
    expect(hash).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("should return a 64-character hex string", async () => {
    const buffer = new TextEncoder().encode("test").buffer;
    const hash = await hashArrayBuffer(buffer);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("should return different hashes for different inputs", async () => {
    const buffer1 = new TextEncoder().encode("input1").buffer;
    const buffer2 = new TextEncoder().encode("input2").buffer;

    const hash1 = await hashArrayBuffer(buffer1);
    const hash2 = await hashArrayBuffer(buffer2);

    expect(hash1).not.toBe(hash2);
  });

  it("should return the same hash for the same input", async () => {
    const buffer1 = new TextEncoder().encode("same input").buffer;
    const buffer2 = new TextEncoder().encode("same input").buffer;

    const hash1 = await hashArrayBuffer(buffer1);
    const hash2 = await hashArrayBuffer(buffer2);

    expect(hash1).toBe(hash2);
  });

  it("should handle empty buffer", async () => {
    const buffer = new ArrayBuffer(0);
    const hash = await hashArrayBuffer(buffer);

    // SHA-256 hash of empty string
    expect(hash).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
