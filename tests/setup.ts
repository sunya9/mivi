import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import "vitest-canvas-mock";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  localStorage.clear();
  Object.defineProperty(window, "indexedDB", {
    value: new IDBFactory(),
  });
});

Object.defineProperty(window, "AudioContext", {
  value: vi.fn(() => ({
    decodeAudioData: vi.fn(() => ({})),
    currentTime: 0,
    createBuffer: vi.fn(() => ({})),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: {
        cancelScheduledValues: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
    })),
  })),
});

let idCounter = 0;

Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => {
      const result = String(idCounter);
      idCounter++;
      return result;
    },
  },
});

// https://github.com/radix-ui/primitives/issues/1822
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
