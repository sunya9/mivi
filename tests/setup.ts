import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import "vitest-canvas-mock";
import { webcrypto } from "node:crypto";

import { cleanup } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import type { Dispatch, SetStateAction } from "react";
import * as standardizedAudioContextMock from "standardized-audio-context-mock";
import { afterEach, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { closeDb } from "@/lib/file-db/file-db";

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: vi.fn<typeof import("virtual:pwa-register/react").useRegisterSW>(() => ({
    needRefresh: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    offlineReady: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    updateServiceWorker: vi.fn<(reloadPage?: boolean) => Promise<void>>(),
  })),
}));

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  localStorage.clear();
  indexedDB = new IDBFactory();
  closeDb();
  vi.clearAllMocks();
});

vi.mock("standardized-audio-context", () => standardizedAudioContextMock);
vi.spyOn(toast, "add");

let idCounter = 0;

vi.stubGlobal("crypto", {
  randomUUID: () => {
    const result = String(idCounter);
    idCounter++;
    return result;
  },
  subtle: webcrypto.subtle,
});

// https://github.com/radix-ui/primitives/issues/1822
window.HTMLElement.prototype.hasPointerCapture = vi.fn<(pointerId: number) => boolean>();
window.HTMLElement.prototype.setPointerCapture = vi.fn<(pointerId: number) => void>();
window.HTMLElement.prototype.releasePointerCapture = vi.fn<(pointerId: number) => void>();
window.HTMLElement.prototype.getAnimations = vi.fn<(options?: GetAnimationsOptions) => Animation[]>(
  () => [],
);
