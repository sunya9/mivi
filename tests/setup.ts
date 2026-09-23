import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import { webcrypto } from "node:crypto";

import { cleanup } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { afterEach, vi } from "vitest";

import { toast } from "@/components/ui/toast";

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: vi.fn<typeof import("virtual:pwa-register/react").useRegisterSW>(() => ({
    needRefresh: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    offlineReady: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    updateServiceWorker: vi.fn<(reloadPage?: boolean) => Promise<void>>(),
  })),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

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
