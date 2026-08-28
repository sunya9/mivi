import { PwaState } from "@/contexts/pwa-context";
import { vi } from "vitest";
import type { Dispatch, SetStateAction } from "react";

/**
 * Default mock PwaState for testing.
 */
export function createMockPwaState(overrides: Partial<PwaState> = {}): PwaState {
  return {
    needRefresh: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    offlineReady: [false, vi.fn<Dispatch<SetStateAction<boolean>>>()],
    updateServiceWorker: vi.fn<(reloadPage?: boolean) => Promise<void>>(),
    canInstall: false,
    installPwa: vi.fn<() => Promise<boolean>>(),
    ...overrides,
  };
}
