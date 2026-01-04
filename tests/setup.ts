import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import "vitest-canvas-mock";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { HTMLCanvasElement } from "@playcanvas/canvas-mock";
import * as nodeCrypto from "node:crypto";

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  localStorage.clear();
  indexedDB = new IDBFactory();
});

vi.stubGlobal("indexedDB", new IDBFactory());

vi.stubGlobal(
  "AudioContext",
  class {
    decodeAudioData = vi.fn(() => ({}));
    currentTime = 0;
    createBuffer = vi.fn(() => ({}));
    createBufferSource = vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    }));
    createGain = vi.fn(() => ({
      connect: vi.fn(),
      gain: {
        cancelScheduledValues: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
    }));
  },
);

let idCounter = 0;

vi.stubGlobal("crypto", {
  randomUUID: () => {
    const result = String(idCounter);
    idCounter++;
    return result;
  },
  subtle: {
    digest: async (algorithm: string, data: ArrayBuffer) => {
      const hash = nodeCrypto.createHash(
        algorithm.toLowerCase().replace("-", ""),
      );
      hash.update(Buffer.from(data));
      return Promise.resolve(hash.digest().buffer);
    },
  },
});

vi.stubGlobal("HTMLCanvasElement", HTMLCanvasElement);

// https://github.com/radix-ui/primitives/issues/1822
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.setPointerCapture = vi.fn();
